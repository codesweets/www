import * as React from "react";
import CodeMirror from "codemirror";
import fileType from "file-type";
import isSvg from "is-svg";
// eslint-disable-next-line sort-imports
import "codemirror/mode/meta";
import {Controlled as ReactCodeMirror} from "react-codemirror2";

require("codemirror/mode/apl/apl");
require("codemirror/mode/asciiarmor/asciiarmor");
require("codemirror/mode/asn.1/asn.1");
require("codemirror/mode/asterisk/asterisk");
require("codemirror/mode/brainfuck/brainfuck");
require("codemirror/mode/clike/clike");
require("codemirror/mode/clojure/clojure");
require("codemirror/mode/cmake/cmake");
require("codemirror/mode/cobol/cobol");
require("codemirror/mode/coffeescript/coffeescript");
require("codemirror/mode/commonlisp/commonlisp");
require("codemirror/mode/crystal/crystal");
require("codemirror/mode/css/css");
require("codemirror/mode/cypher/cypher");
require("codemirror/mode/d/d");
require("codemirror/mode/dart/dart");
require("codemirror/mode/diff/diff");
require("codemirror/mode/django/django");
require("codemirror/mode/dockerfile/dockerfile");
require("codemirror/mode/dtd/dtd");
require("codemirror/mode/dylan/dylan");
require("codemirror/mode/ebnf/ebnf");
require("codemirror/mode/ecl/ecl");
require("codemirror/mode/eiffel/eiffel");
require("codemirror/mode/elm/elm");
require("codemirror/mode/erlang/erlang");
require("codemirror/mode/factor/factor");
require("codemirror/mode/fcl/fcl");
require("codemirror/mode/forth/forth");
require("codemirror/mode/fortran/fortran");
require("codemirror/mode/gas/gas");
require("codemirror/mode/gfm/gfm");
require("codemirror/mode/gherkin/gherkin");
require("codemirror/mode/go/go");
require("codemirror/mode/groovy/groovy");
require("codemirror/mode/haml/haml");
require("codemirror/mode/handlebars/handlebars");
require("codemirror/mode/haskell/haskell");
require("codemirror/mode/haskell-literate/haskell-literate");
require("codemirror/mode/haxe/haxe");
require("codemirror/mode/htmlembedded/htmlembedded");
require("codemirror/mode/htmlmixed/htmlmixed");
require("codemirror/mode/http/http");
require("codemirror/mode/idl/idl");
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/jinja2/jinja2");
require("codemirror/mode/jsx/jsx");
require("codemirror/mode/julia/julia");
require("codemirror/mode/livescript/livescript");
require("codemirror/mode/lua/lua");
require("codemirror/mode/markdown/markdown");
require("codemirror/mode/mathematica/mathematica");
require("codemirror/mode/mbox/mbox");
require("codemirror/mode/mirc/mirc");
require("codemirror/mode/mllike/mllike");
require("codemirror/mode/modelica/modelica");
require("codemirror/mode/mscgen/mscgen");
require("codemirror/mode/mumps/mumps");
require("codemirror/mode/nginx/nginx");
require("codemirror/mode/nsis/nsis");
require("codemirror/mode/ntriples/ntriples");
require("codemirror/mode/octave/octave");
require("codemirror/mode/oz/oz");
require("codemirror/mode/pascal/pascal");
require("codemirror/mode/pegjs/pegjs");
require("codemirror/mode/perl/perl");
require("codemirror/mode/php/php");
require("codemirror/mode/pig/pig");
require("codemirror/mode/powershell/powershell");
require("codemirror/mode/properties/properties");
require("codemirror/mode/protobuf/protobuf");
require("codemirror/mode/pug/pug");
require("codemirror/mode/puppet/puppet");
require("codemirror/mode/python/python");
require("codemirror/mode/q/q");
require("codemirror/mode/r/r");
require("codemirror/mode/rpm/rpm");
require("codemirror/mode/rst/rst");
require("codemirror/mode/ruby/ruby");
require("codemirror/mode/rust/rust");
require("codemirror/mode/sas/sas");
require("codemirror/mode/sass/sass");
require("codemirror/mode/scheme/scheme");
require("codemirror/mode/shell/shell");
require("codemirror/mode/sieve/sieve");
require("codemirror/mode/slim/slim");
require("codemirror/mode/smalltalk/smalltalk");
require("codemirror/mode/smarty/smarty");
require("codemirror/mode/solr/solr");
require("codemirror/mode/soy/soy");
require("codemirror/mode/sparql/sparql");
require("codemirror/mode/spreadsheet/spreadsheet");
require("codemirror/mode/sql/sql");
require("codemirror/mode/stex/stex");
require("codemirror/mode/stylus/stylus");
require("codemirror/mode/swift/swift");
require("codemirror/mode/tcl/tcl");
require("codemirror/mode/textile/textile");
require("codemirror/mode/tiddlywiki/tiddlywiki");
require("codemirror/mode/tiki/tiki");
require("codemirror/mode/toml/toml");
require("codemirror/mode/tornado/tornado");
require("codemirror/mode/troff/troff");
require("codemirror/mode/ttcn/ttcn");
require("codemirror/mode/ttcn-cfg/ttcn-cfg");
require("codemirror/mode/turtle/turtle");
require("codemirror/mode/twig/twig");
require("codemirror/mode/vb/vb");
require("codemirror/mode/vbscript/vbscript");
require("codemirror/mode/velocity/velocity");
require("codemirror/mode/verilog/verilog");
require("codemirror/mode/vhdl/vhdl");
require("codemirror/mode/vue/vue");
require("codemirror/mode/webidl/webidl");
require("codemirror/mode/xml/xml");
require("codemirror/mode/xquery/xquery");
require("codemirror/mode/yacas/yacas");
require("codemirror/mode/yaml/yaml");
require("codemirror/mode/yaml-frontmatter/yaml-frontmatter");
require("codemirror/mode/z80/z80");

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
    const modeInfo = (CodeMirror as any).findModeByExtension(this.props.extension);

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
    return <div style={{position: "relative", zIndex: 0}}>
      <ReactCodeMirror value={this.props.buffer.toString()} onBeforeChange={null} options={{
        lineNumbers: true,
        mode: modeInfo && modeInfo.mode,
        readOnly: true,
        tabSize: 2
      }} />
    </div>;
  }
}
