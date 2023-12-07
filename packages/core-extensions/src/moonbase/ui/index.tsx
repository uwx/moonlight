import { ExtensionTag, WebpackRequireType } from "@moonlight-mod/types";
import card from "./card";
import filterBar from "./filterBar";

export enum ExtensionPage {
  Info,
  Description,
  Settings
}

export default (require: WebpackRequireType) => {
  const React = require("common_react");
  const spacepack = require("spacepack_spacepack").spacepack;
  const Flux = require("common_flux");

  const { MoonbaseSettingsStore } =
    require("moonbase_stores") as typeof import("../webpackModules/stores");

  const ExtensionCard = card(require);
  const FilterBar = React.lazy(() =>
    filterBar(require).then((c) => ({ default: c }))
  );

  const Margins = spacepack.findByCode("marginCenterHorz:")[0].exports;
  const SearchBar = spacepack.findByCode("Messages.SEARCH", "hideSearchIcon")[0]
    .exports.default;

  return function Moonbase() {
    const { Text } = require("common_components");

    const { extensions } = Flux.useStateFromStoresObject(
      [MoonbaseSettingsStore],
      () => {
        return { extensions: MoonbaseSettingsStore.extensions };
      }
    );

    const [query, setQuery] = React.useState("");
    const [selectedTags, setSelectedTags] = React.useState(new Set<string>());

    const sorted = Object.values(extensions).sort((a, b) => {
      const aName = a.manifest.meta?.name ?? a.id;
      const bName = b.manifest.meta?.name ?? b.id;
      return aName.localeCompare(bName);
    });

    const filtered = sorted.filter(
      (ext) =>
        (ext.manifest.meta?.name?.toLowerCase().includes(query) ||
          ext.manifest.meta?.tagline?.toLowerCase().includes(query) ||
          ext.manifest.meta?.description?.toLowerCase().includes(query)) &&
        [...selectedTags.values()].every(
          (tag) => ext.manifest.meta?.tags?.includes(tag as ExtensionTag)
        )
    );

    return (
      <>
        <Text
          className={Margins.marginBottom20}
          variant="heading-lg/semibold"
          tag="h2"
        >
          Moonbase
        </Text>
        <SearchBar
          size={SearchBar.Sizes.MEDIUM}
          query={query}
          onChange={(v: string) => setQuery(v.toLowerCase())}
          onClear={() => setQuery("")}
          autoFocus={true}
          autoComplete="off"
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: "off",
            spellCheck: "false"
          }}
        />
        <FilterBar
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
        {filtered.map((ext) => (
          <ExtensionCard id={ext.id} key={ext.id} />
        ))}
      </>
    );
  };
};
