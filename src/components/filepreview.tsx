import * as React from "react";
import {CodeEditor} from "./codeeditor";
import CodeMirror from "codemirror";
// eslint-disable-next-line sort-imports
import "codemirror/mode/meta";
import fileType from "file-type";
import isSvg from "is-svg";

export interface FilePreviewProps {

  /** Without the dot: "txt", "png", etc. */
  extension: string;
  buffer: Buffer;
}
const imageExtensions = {
  bmp: true,
  cur: true,
  gif: true,
  ico: true,
  jpeg: true,
  jpg: true,
  png: true,
  webp: true
};

export class FilePreview extends React.Component<FilePreviewProps> {
  public render () {
    const type = fileType(this.props.buffer);
    // eslint-disable-next-line no-mixed-operators
    const mime = imageExtensions[type && type.ext] && type.mime || isSvg(this.props.buffer) && "image/svg+xml";
    if (mime) {
      const blob = new Blob([this.props.buffer.buffer], {type: mime});
      const url = URL.createObjectURL(blob);
      return <div style={{
        backgroundImage: `url(${url})`,
        backgroundPositionX: "center",
        backgroundPositionY: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        height: "300px"
      }}></div>;
    }
    const modeInfo = (CodeMirror as any).findModeByExtension(this.props.extension);
    return <CodeEditor
      value={this.props.buffer.toString()}
      mode={modeInfo && modeInfo.mode}
      readOnly/>;
  }
}
