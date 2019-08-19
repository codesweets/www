import "codesweets/bin/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Col, Glyphicon, Grid, Panel, Row} from "react-bootstrap";
import Form, {IChangeEvent, ISubmitEvent} from "react-jsonschema-form";
// eslint-disable-next-line id-length
import $ from "jquery";
import {Controlled as CodeMirror} from "react-codemirror2";
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
  definitions: {},
  properties: {
    components: {
      items: {
        dependencies: {
          typename: {
            oneOf: taskSchemas
          }
        },
        properties: {
          typename: {
            enum: taskNames,
            title: "Task",
            type: "string"
          }
        },
        required: ["typename"],
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
  console.log(meta.typename);
  if (meta.hidden) {
    return;
  }
  schema.definitions[meta.typename] = meta.schema;
  taskNames.push(meta.typename);
  taskNames.sort();

  const componentSchema: JSONSchema6 = {
    properties: {
      typename: {
        enum: [meta.typename]
      },
      [meta.typename]: {$ref: `#/definitions/${meta.typename}`}
    }
  };
  taskSchemas.push(componentSchema);

  if (meta.uiSchema) {
    uiSchemas[meta.typename] = meta.uiSchema;
  }

  // eslint-disable-next-line @typescript-eslint/no-extra-parens
  const compare = (lhs: any, rhs: any) => ((lhs > rhs) as any) - ((lhs < rhs) as any);
  taskSchemas.sort((lhs: any, rhs: any) => compare(lhs.properties.typename.enum[0], rhs.properties.typename.enum[0]));

  console.log(JSON.stringify(meta.schema));
};

let render: () => void = null;
let submit: (event: ISubmitEvent<TaskSaved>) => void = null;

let data = {};
let code = "{}";
let glyph = "ok";
let output = "";

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
  render();
};

const formChanged = (event: IChangeEvent<TaskSaved>) => {
  console.log("FORM CHANGED");
  glyph = "ok";
  data = event.formData;
  code = JSON.stringify(data, null, 2);
  render();
};

const {fs} = windowAny;

const buildFsTree = (parentDir: string) => {
  // eslint-disable-next-line no-sync
  for (const path of fs.readdirSync(parentDir)) {
    // eslint-disable-next-line no-sync
    if (fs.statSync(path).isDirectory()) {
      buildFsTree(path);
    }
  }
};

const tree = {
  children: [
    {
      children: [
        {name: "child1"},
        {name: "child2"}
      ],
      name: "parent"
    },
    {
      children: [],
      loading: true,
      name: "loading parent"
    },
    {
      children: [
        {
          children: [
            {name: "nested child 1"},
            {name: "nested child 2"}
          ],
          name: "nested parent"
        }
      ],
      name: "parent"
    }
  ],
  name: "rootx"
};

class TreeExample extends React.PureComponent {
  public constructor (props) {
    super(props);
    this.state = {data: tree};
  }

  public onToggle (node, toggled) {
    console.log(node, toggled);
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
        data={(this.state as any).data}
        onToggle={(node, toggled) => this.onToggle(node, toggled)}
      />
    );
  }
}

render = () => {
  ReactDOM.render(
    <Grid>
      <Row>
        <Col md={7}>
          <Form
            schema={schema}
            uiSchema={uiSchema}
            formData={data}
            onChange={formChanged}
            onSubmit={submit} />
        </Col>
        <Col md={5}>
          <Row>
            <Panel>
              <Panel.Heading><Glyphicon glyph={glyph} /> JSON</Panel.Heading>
              <div style={{position: "relative", zIndex: 0}}>
                <CodeMirror value={code} onBeforeChange={codeChanged} options={{
                  lineNumbers: true,
                  tabSize: 2
                }} />
              </div>
            </Panel>
          </Row>
          <Row>
            <Panel>
              <Panel.Heading>Output</Panel.Heading>
              <div style={{position: "relative", zIndex: 0}}>
                <CodeMirror value={output} onBeforeChange={null} options={{
                  lineNumbers: true,
                  readOnly: true,
                  tabSize: 2
                }} />
              </div>
            </Panel>
          </Row>
          <Row>
            <Panel>
              <Panel.Heading>Doubt</Panel.Heading>
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
  submit = (event) => {
    // Clear the browser fs (or re-initialize)
    output = "";
    const saved = event.formData;
    const task = sweet.Task.deserialize(saved) as TaskRoot;
    console.log("root", task);
    task.logger = (component, type, ...args) => {
      console.log(type, component.meta.typename, ...args);
      output += `${component.meta.typename} ${args.join(", ")}\n`;
      render();
      if (type === "error") {
        const query = $(`#root_components_${component.id}_typename`);
        query.popover({
          content: args.join("\n"),
          trigger: "focus"
        });
        query.focus();
      }
    };
    task.run();
  };
  render();
};
main();
