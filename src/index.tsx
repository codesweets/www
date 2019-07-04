import * as React from "react";
import * as ReactDOM from "react-dom";
import {Col, Glyphicon, Grid, Panel, Row} from "react-bootstrap";
import Form, {IChangeEvent, ISubmitEvent} from "react-jsonschema-form";
// eslint-disable-next-line id-length
import $ from "jquery";
import {Controlled as CodeMirror} from "react-codemirror2";
import {Hello} from "./components/hello";
import {JSONSchema6} from "json-schema";

type TaskSaved = import("@codesweets/core").TaskSaved;
type TaskRoot = import("@codesweets/core").TaskRoot;
type TaskMeta = import("@codesweets/core").TaskMeta;

ReactDOM.render(
  <Hello compiler="TypeScript" framework="React" />,
  document.getElementById("example")
);

// eslint-disable-next-line no-eval
const loadModule = (url: string): Promise<any> => eval(`import(${JSON.stringify(url)})`);

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
      data: meta.schema,
      typename: {
        enum: [meta.typename]
      }
    }
  };
  taskSchemas.push(componentSchema);
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

render = () => {
  ReactDOM.render(
    <Grid>
      <Row>
        <Col md={7}>
          <Form
            schema={schema}
            formData={data}
            onChange={formChanged}
            onSubmit={submit} />
        </Col>
        <Col md={5}>
          <Row>
            <Panel>
              <Panel.Heading><Glyphicon glyph={glyph} /> JSON</Panel.Heading>
              <CodeMirror value={code} onBeforeChange={codeChanged} options={{
                lineNumbers: true,
                tabSize: 2
              }} />
            </Panel>
          </Row>
          <Row>
            <Panel>
              <Panel.Heading>Output</Panel.Heading>
              <CodeMirror value={output} onBeforeChange={null} options={{
                lineNumbers: true,
                readOnly: true,
                tabSize: 2
              }} />
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
  const sweet = await loadModule("https://unpkg.com/@codesweets/core");
  submit = (event) => {
    output = "";
    const saved = event.formData;
    const task = sweet.default.Task.deserialize(saved) as TaskRoot;
    console.log("root", task);
    task.logger = (component, type, ...args) => {
      console.log(type, ...args);
      output += `${args.join(", ")}\n`;
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

  await Promise.all([
    loadModule("https://unpkg.com/@codesweets/file"),
    loadModule("https://unpkg.com/@codesweets/git"),
    loadModule("https://unpkg.com/@codesweets/github")
  ]);
  render();

  console.log(JSON.stringify(schema));
};
main();
