import * as React from "react";
import {ActionMeta, ValueType} from "react-select/src/types";
import AsyncSelect from "react-select/async";

export interface SearchOption {
  label: string;
  value: string;
}

export interface SearchProps {
  onChange?: (value: ValueType<SearchOption>, action: ActionMeta) => void;
}

export class Search extends React.Component<SearchProps, {} > {
  public constructor (props: Readonly<SearchProps>) {
    super(props);
    this.state = {
      data: []
    };
  }

  public render () {
    const searchUrl = new URL("http://registry.npmjs.com/-/v1/search");
    return <AsyncSelect
      isSearchable={true}
      loadOptions={async (inputValue, callback) => {
        searchUrl.searchParams.set("text", `keywords:codesweets-tasks ${inputValue}`);
        const response = await fetch(searchUrl.href);
        const json = await response.json();
        const result = json.objects.map((value: any) => ({label: value.package.name, value: value.package.name}));
        callback(result);
      }}
      onChange={this.props.onChange}
    />;
  }
}
