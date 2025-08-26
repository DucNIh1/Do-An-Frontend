export default {
  locales: ["en", "vi"],
  defaultNamespace: "translation",
  input: ["src/**/*.{js,jsx,ts,tsx}"],
  output: "src/i18n/$LOCALE/$NAMESPACE.json",
  keySeparator: false,
  namespaceSeparator: false,
  createOldCatalogs: false,
  keepRemoved: true,
  defaultValue: "",
};
