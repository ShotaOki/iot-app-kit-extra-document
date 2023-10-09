/* eslint-disable no-template-curly-in-string */
import "./App.css";
import { SceneViewer } from "@iot-app-kit/scene-composer";
import {
  useOverrideTags,
  DirectSceneLoader,
} from "@iak-extra/scene-composer-extra";
import { useEffect, useState } from "react";

/**
 * コンテンツを遅延表示する
 * @param parameter
 * @returns
 */
function DynamicContents(parameter: { content: string }) {
  const sceneLoader = new DirectSceneLoader("/test-content.json");

  // 変数（Targetを置き換える関数）を宣言する
  let fc = (_: any): any => {
    return 0;
  };
  // 関数をevalで再定義する
  // eslint-disable-next-line no-eval
  eval(`
    fc = (replaceTag) => {
      ${parameter.content.replace("${0}", "return replaceTag")}
    }
  `);

  /** TwinMakerのタグを、再定義した関数で上書きする */
  // eslint-disable-next-line no-eval
  const controller = useOverrideTags({
    Target: (replaceTag: any) => fc(replaceTag),
  });

  return (
    <SceneViewer
      sceneComposerId={controller.composerId}
      sceneLoader={sceneLoader}
      activeCamera="Camera1"
    />
  );
}

function App() {
  const [ReplaceView, SetReplaceView] = useState<JSX.Element>(<div />);

  useEffect(() => {
    // クエリに一致するパラメータを参照する
    const parameter = window.location.href.replace(/^.+\?content=/, "");
    // 英数字とハイフン以外を含むのなら処理をしない
    const regex = /^[a-zA-Z0-9-]+$/;
    if (!regex.test(parameter)) {
      return;
    }
    // 参照先のドメインと拡張子は固定する
    fetch(
      "/iot-app-kit-extra-document/document-page-contents/" + parameter + ".txt"
    ).then((response) => {
      response.text().then((content) => {
        if (content.includes("${0}")) {
          SetReplaceView(<DynamicContents content={content} />);
        }
      });
    });
  }, []);

  return ReplaceView;
}

export default App;
