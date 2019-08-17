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
  private options: Promise<SearchOption[]>;

  public constructor (props: Readonly<SearchProps>) {
    super(props);
    this.state = {
      data: []
    };
    this.options = this.populateOptions(0);
  }

  private async populateOptions (index: number) {
    const amountPerPage = 250;
    const searchUrl = new URL("https://registry.npmjs.com/-/v1/search");
    searchUrl.searchParams.set("text", "keywords:codesweets-tasks");
    searchUrl.searchParams.set("size", amountPerPage.toString());
    searchUrl.searchParams.set("from", index.toString());
    const response = await fetch(searchUrl.href);
    const json = await response.json();
    const result: SearchOption[] = json.objects.map((value: any) => ({
      label: `${value.package.name} - ${value.package.description}`,
      value: value.package.name
    }));
    if (json.total > index + amountPerPage) {
      return result.concat(await this.populateOptions(index + amountPerPage));
    }
    return result;
  }

  private async loadOptions (inputValue: string) {
    const options = await this.options;
    return options.filter((option) => option.value.toLowerCase().includes(inputValue)).slice(0, 8);
  }

  public render () {
    return <AsyncSelect
      cacheOptions
      defaultOptions
      isClearable={true}
      loadOptions={(inputValue) => this.loadOptions(inputValue)}
      onChange={this.props.onChange}
    />;
  }
}
