/* eslint-disable no-template-curly-in-string */
import "./App.css";
import { SceneViewer } from "@iot-app-kit/scene-composer";
import {
  useOverrideTags,
  DirectSceneLoader,
  ButtonStyle as _ButtonStyle,
} from "@iak-extra/scene-composer-extra";
import { useEffect, useState } from "react";

/**
 * コンテンツを遅延表示する
 * @param parameter
 * @returns
 */
function DynamicContents(parameter: { content: string }) {
  const sceneLoader = new DirectSceneLoader(
    "/iot-app-kit-extra-document/test-content.json"
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var ButtonStyle = _ButtonStyle;
  // 変数（Targetを置き換える関数）を宣言する
  let fc = (_: any): any => {
    return 0;
  };
  // 関数をevalで再定義する
  // eslint-disable-next-line no-eval
  eval(`
    fc = (r) => {
      console.log(r);
      ${parameter.content.replace("${0}", "return r")}
    }
  `);

  /** TwinMakerのタグを、再定義した関数で上書きする */
  // eslint-disable-next-line no-eval
  const controller = useOverrideTags({
    Target: fc,
  });

  return (
    <SceneViewer
      sceneComposerId={controller.composerId}
      sceneLoader={sceneLoader}
      activeCamera="Camera1"
    />
  );
}

function DemoContents() {
  const sceneLoader = new DirectSceneLoader(
    "/iot-app-kit-extra-document/demo-content.json"
  );
  const controller = useOverrideTags({
    // TwinMakerのタグをボタンに置き換える
    壁のボタン: (replaceTag) =>
      replaceTag.toButton
        ?.create({
          angle: 90,
          content: "Close",
          width: 0.7,
          height: 0.24,
          stateStyle: _ButtonStyle.Standard,
        })
        .onClickEvent(() => {
          console.log("clicked: 閉じる");
        }),
    // TwinMakerのタグをボタンに置き換える
    兎田ぺこら: (replaceTag) =>
      replaceTag.toMMD
        ?.create({
          angle: 0,
          scale: 0.08,
          pmxPath:
            "/iot-app-kit-extra-document/mmd/UsadaPekora/PMX/UsadaPekora.pmx",
          useMotionList: {
            dance:
              "/iot-app-kit-extra-document/mmd/Alicia/MMD Motion/2分ループステップ1.vmd",
          },
        })
        .onStateChangeEvent((mesh, model, state) => {
          return ["dance"];
        }),
    // TwinMakerのタグをボタンに置き換える
    壁の時計: (replaceTag) =>
      replaceTag.toText
        ?.create({
          angle: 0,
          content: "Time",
        })
        .onAnimating((text) => {
          text.set({
            content: new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
              .toISOString()
              .split(".")[0],
          });
        }),
    部屋: (replaceTag) =>
      replaceTag.toGLTF?.create({
        angle: 0,
        modelPath:
          "/iot-app-kit-extra-document/example/studio_apartment_vray_baked_textures_included.glb",
      }),
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
        } else if (content.includes("${DEMO}")) {
          SetReplaceView(<DemoContents />);
        }
      });
    });
  }, []);

  return ReplaceView;
}

export default App;
