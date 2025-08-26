import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-red-600">
        {" "}
        <h1>{t("login_title")}</h1>
      </h1>
    </>
  );
}

export default App;
