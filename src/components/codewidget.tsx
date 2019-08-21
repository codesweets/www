import * as React from "react";
import {CodeEditor} from "./codeeditor";

export interface CodeWidgetProps {
  externalProps: any;
}
export class CodeWidget extends React.Component<CodeWidgetProps> {
  public constructor (props: Readonly<CodeWidgetProps>) {
    super(props);
    this.state = {focused: true};
  }

  public render () {
    return <div style={{
      borderColor: "#ccc",
      borderRadius: "2px",
      borderStyle: "solid",
      borderWidth: "1px"
    }}>
      <CodeEditor
        value={this.props.externalProps.value}
        mode={this.props.externalProps.options.mode}
        onBeforeChange={(editor: any, codeData: any, value: string) => this.props.externalProps.onChange(value)}
      />
    </div>;
  }
}

export const CodeWidgetFactory = (externalProps) => <CodeWidget externalProps={externalProps}></CodeWidget>;

