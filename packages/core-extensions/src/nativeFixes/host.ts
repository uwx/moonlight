import { app, nativeTheme } from "electron";

const config = moonlightHost.getConfig("nativeFixes") ?? {};

const enabledFeatures = app.commandLine
  .getSwitchValue("enable-features")
  .split(",");

moonlightHost.events.on("window-created", function (browserWindow) {
  if (config.devtoolsThemeFix ?? true) {
    browserWindow.webContents.on("devtools-opened", () => {
      if (!nativeTheme.shouldUseDarkColors) return;
      nativeTheme.themeSource = "light";
      setTimeout(() => {
        nativeTheme.themeSource = "dark";
      }, 100);
    });
  }
});

if (config.disableRendererBackgrounding ?? true) {
  // Discord already disables UseEcoQoSForBackgroundProcess and some other
  // related features
  app.commandLine.appendSwitch("disable-renderer-backgrounding");
  app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");

  // already added on Windows, but not on other operating systems
  app.commandLine.appendSwitch("disable-background-timer-throttling");
}

if (process.platform === "linux") {
  if (config.linuxAutoscroll ?? false) {
    app.commandLine.appendSwitch(
      "enable-blink-features",
      "MiddleClickAutoscroll"
    );
  }

  if (config.linuxSpeechDispatcher ?? true) {
    app.commandLine.appendSwitch("enable-speech-dispatcher");
  }
}

// NOTE: Only tested if this appears on Windows, it should appear on all when
//       hardware acceleration is disabled
const noAccel = app.commandLine.hasSwitch("disable-gpu-compositing");
if ((config.vaapi ?? true) && !noAccel) {
  enabledFeatures.push("VaapiVideoEncoder", "VaapiVideoDecoder");
  if (process.platform === "linux")
    enabledFeatures.push("VaapiVideoDecodeLinuxGL");
}

app.commandLine.appendSwitch(
  "enable-features",
  [...new Set(enabledFeatures)].join(",")
);
