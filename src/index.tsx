if (typeof navigator.serviceWorker !== "undefined") {
  navigator.serviceWorker.register("service-worker.js").then(console.log, console.error);
}

import "codesweets/bin/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Col, Glyphicon, Grid, Panel, Row} from "react-bootstrap";
import Form, {IChangeEvent, ISubmitEvent} from "react-jsonschema-form";
// eslint-disable-next-line id-length
import $ from "jquery";
import {CodeEditor} from "./components/codeeditor";
import {CodeWidgetFactory} from "./components/codewidget";
import {FilePreview} from "./components/filepreview";
import {JSONSchema6} from "json-schema";
import {Search} from "./components/search";
import {Treebeard} from "react-treebeard";

type TaskSaved = import("@codesweets/core").TaskSaved;
type TaskRoot = import("@codesweets/core").TaskRoot;
type TaskMeta = import("@codesweets/core").TaskMeta;

const windowAny = window as any;

const loadModule = (url: string): any => windowAny.require(url);

const taskNames: string[] = [];
const taskSchemas: JSONSchema6[] = [];

const schema: JSONSchema6 = {
  properties: {
    components: {
      items: {
        dependencies: {
          qualifiedName: {
            oneOf: taskSchemas
          }
        },
        properties: {
          qualifiedName: {
            enum: taskNames,
            title: "Task",
            type: "string"
          }
        },
        required: ["qualifiedName"],
        type: "object"
      },
      title: "Tasks",
      type: "array"
    }
  },
  type: "object"
};

const uiSchemas = {};
const uiSchema = {
  components: {
    items: uiSchemas
  }
};

ReactDOM.render(
  <Search
    onSelect={(library) => {
      loadModule(library);
      console.log(JSON.stringify(schema));
    }}
  />,
  document.getElementById("example")
);
const globals: any = global;
globals.ontaskmeta = (meta: TaskMeta) => {
  console.log("META", meta.qualifiedName);
  if (meta.hidden) {
    return;
  }
  taskNames.push(meta.qualifiedName);
  taskNames.sort();

  const componentSchema: JSONSchema6 = {
    properties: {
      qualifiedName: {
        enum: [meta.qualifiedName]
      },
      [meta.qualifiedName]: meta.schema
    }
  };
  taskSchemas.push(componentSchema);

  if (meta.uiSchema) {
    uiSchemas[meta.qualifiedName] = meta.uiSchema;
  }

  // eslint-disable-next-line @typescript-eslint/no-extra-parens
  const compare = (lhs: any, rhs: any) => ((lhs > rhs) as any) - ((lhs < rhs) as any);
  const getName = (taskSchema: JSONSchema6 | any) => taskSchema.properties.qualifiedName.enum[0];
  taskSchemas.sort((lhs: any, rhs: any) => compare(getName(lhs), getName(rhs)));

  console.log(JSON.stringify(meta.schema));
};

let render: () => void = null;
let submit: (event: ISubmitEvent<TaskSaved>) => void = null;

let data: TaskSaved = {} as any;
let code = "{}";
let glyph = "ok";
let output = "";

let fileBuffer = Buffer.alloc(0);
let fileExtension = "";

const scanAndloadModules = (parent: TaskSaved) => {
  console.log(parent.qualifiedName);
  if (parent.qualifiedName) {
    loadModule(parent.qualifiedName.split(" - ")[1]);
  }

  if (parent.components) {
    for (const component of parent.components) {
      scanAndloadModules(component);
    }
  }
};

const updateProperties = () => {
  const taskRootQualifiedName = "TaskRoot - @codesweets/core";
  const taskRootData = data[taskRootQualifiedName] as Record<string, any>;
  if (taskRootData) {
    $("label.control-label[for^='root_']").add("input[type='checkbox'][id^='root_']").
      each((index, element) => {
        const path = element.getAttribute("for") || element.id;
        const parts = path.split("_").slice(1);
        console.log(parts);
        if (parts[0] === taskRootQualifiedName) {
          return;
        }
        let it: any = data;
        for (const part of parts) {
          if (!it) {
            break;
          }
          it = it[part];
        }

        const parent = $(element).closest(".form-group.field");
        const isOptional = parent.find("span.required").length === 0;
        const isSatisified = typeof it !== "undefined";

        const hideSatisfied = isSatisified && taskRootData.hideSatisfiedInputs;
        const hideOptional = isOptional && taskRootData.hideOptionalInputs;

        if (hideSatisfied || hideOptional) {
          parent.css("display", "none");
          return;
        }

        parent.css("display", "");
      });
  }
};

const codeChanged = (editor: any, codeData: any, value: string) => {
  console.log("CODE CHANGED");
  code = value;
  try {
    data = JSON.parse(value);
    glyph = "ok";
  } catch (err) {
    console.log(err);
    glyph = "remove";
  }

  scanAndloadModules(data);
  render();
  updateProperties();
};

const formChanged = (event: IChangeEvent<TaskSaved>) => {
  console.log("FORM CHANGED");
  glyph = "ok";
  data = event.formData;
  code = JSON.stringify(data, null, 2);
  render();
  updateProperties();
};

const fs = windowAny.require("fs");
const path = windowAny.require("path");
const buildFsTree = (parentDir: string, name: string) => {
  const node = {
    children: [],
    isFile: false,
    name,
    path: parentDir
  };

  for (const childName of fs.readdirSync(parentDir)) {
    const childPath = path.join(parentDir, childName);
    if (fs.statSync(childPath).isDirectory()) {
      node.children.push(buildFsTree(childPath, childName));
    } else {
      node.children.push({isFile: true, name: childName, path: childPath});
    }
  }
  return node;
};

let tree = {};

class TreeExample extends React.PureComponent {
  public constructor (props) {
    super(props);
    this.state = {data: tree};
  }

  public onToggle (node, toggled) {
    console.log(node, toggled);

    if (node.isFile) {
      fileBuffer = fs.readFileSync(node.path);
      fileExtension = path.extname(node.path).slice(1);
      render();
    }

    // eslint-disable-next-line no-shadow
    const {cursor, data} = this.state as any;
    if (cursor) {
      this.setState(() => ({active: false, cursor}));
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    this.setState(() => ({cursor: node, data: {...data}}));
  }

  public render () {
    return (
      <Treebeard
        data={tree}
        onToggle={(node, toggled) => this.onToggle(node, toggled)}
      />
    );
  }
}

render = () => {
  const widgets = {
    code: CodeWidgetFactory
  };

  ReactDOM.render(
    <Grid>
      <Row>
        <Col md={7}>
          <Form
            schema={schema}
            uiSchema={uiSchema}
            formData={data}
            onChange={formChanged}
            onSubmit={submit}
            widgets={widgets} />
        </Col>
        <Col md={5}>
          <Row>
            <Panel>
              <Panel.Heading><Glyphicon glyph={glyph} /> JSON</Panel.Heading>
              <CodeEditor
                value={code}
                mode="javascript"
                onBeforeChange={codeChanged} />
            </Panel>
          </Row>
          <Row>
            <Panel>
              <Panel.Heading>Output</Panel.Heading>
              <CodeEditor
                value={output}
                readOnly />
            </Panel>
          </Row>
          <Row>
            <Panel>
              <Panel.Heading>Preview</Panel.Heading>
              <FilePreview extension={fileExtension} buffer={fileBuffer}/>
            </Panel>
          </Row>
          <Row>
            <Panel>
              <Panel.Heading>Files</Panel.Heading>
              <TreeExample />
            </Panel>
          </Row>
        </Col>
      </Row>
    </Grid>
    , document.getElementById("app")
  );
};

render();

const main = async () => {
  const sweet = await loadModule("@codesweets/core");
  const taskRootMeta = sweet.TaskRoot.meta as TaskMeta;
  schema.properties[taskRootMeta.qualifiedName] = taskRootMeta.schema;
  submit = async (event) => {
    windowAny.inMemory.empty();
    output = "";
    const saved = event.formData;
    const logger = (component, type, ...args) => {
      console.log(type, component.meta.qualifiedName, ...args);
      output += `${component.meta.qualifiedName} ${args.join(", ")}\n`;
      render();
      if (type === "error") {
        const query = $(`#root_components_${component.id}_qualifiedName`);
        query.popover({
          content: args.join("\n"),
          trigger: "focus"
        });
        query.focus();
      }
    };
    const task = sweet.Task.deserialize(saved, logger) as TaskRoot;
    console.log("root", task);
    await task.run();
    tree = buildFsTree("/", "/");
    render();
  };
  render();
};
main();
