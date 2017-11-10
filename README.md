# video-demo-web-combined

## 1. 创建应用

在 Wilddog [控制面板](https://www.wilddog.com/dashboard/) 中创建一个新应用或使用已有应用。 [如何创建应用？](https://docs.wilddog.com/console/creat.html)

## 2. 开启匿名登录认证方式

应用创建成功后，进入“管理应用-->身份认证-->登录方式”。开启匿名登录。

![](https://itolfh.gitbooks.io/video/content/assets/openanonymous.png)

## 3. 开启实时视频通话

进入 管理应用-实时视频通话，开启视频通话功能。此处注意配置页面下方`config`中的`videoURL`

![](https://github.com/WildDogTeam/video-demo-web-conference/raw/master/images/video_quickstart_openVideo.png)

**提示：**
如果之前没有使用过sync服务的需要手动开启
![](https://github.com/WildDogTeam/video-demo-web-conference/raw/master/images/opensync.png)

## 4. 开启实时视频通话

填写`index.html`页面下方的选项(`boardURL`、`authDomain`、`syncURL`可以使用同一个，`videoURL`需要填写实时视频通话中的`appId`)

```js
var config = {
    videoURL: "appId",
    boardURL: "appId",
    authDomain: "appId.wilddog.com",
    syncURL: "https://appId.wilddogio.com",
    //如果需要体验图片上传服务，请填写下面的信息
    //七牛上传会根据以下生成token
    domainUrl: "",七牛cdnUrl
    accessKey: "", //七牛accessKey
    secretKey: "", //七牛secretKey
    putPolicy: {
        "scope": "", //七牛bucket
        "deadline":  //token超时时间（时间戳即可）
    }
}
```

## 4. 启动本地 Web 服务

启动本地 Web 服务，建立 https 环境。快速入门中采用 Node.js 搭建本地服务，用户也可以使用其他方式启动本地 Web 服务。使用 Node.js 开启本地 Web 服务：

```js
node https_channel_server.js
```

## 5. 在浏览器中打开页面

本地 Web 服务启动后，访问 [https://127.0.0.1:8080/?room=12&name=123&dimension=240p](https://127.0.0.1:8080/?room=12&name=123&dimension=240p) 就可以看到快速入门页面。

- `room` 为房间号
- `name` 为用户昵称
- `dimension` 清晰度

## 注：
*必须通过启动https服务器来访问页面才可使用，直接打开html无效
