<template>
	<div>
		<div class="artplayer-app"></div>
    <div class="zfile-video-switch-tools" v-if="currentVideo && isMobile">
      <el-button :disabled="!getPrevAndNextVideo(currentVideo.name)?.prev" :icon="IconPrev" @click="playPrevVideo">上一个视频</el-button>
      <el-button :disabled="!getPrevAndNextVideo(currentVideo.name)?.next" :icon="IconNext" @click="playNextVideo">下一个视频</el-button>
    </div>
		<div class="zfile-video-tools" :class="hiddenTools ? 'hidden-important' : ''">
			<template v-if="storageConfigStore.folderConfig.permission.download">
        <div class="zfile-video-tools-item" @click="openTarget('download')">
          <el-tooltip placement="top">
            <template #content>
              直接下载
            </template>
            <img src="../../../assets/image/video-download.png" alt="下载">
          </el-tooltip>
        </div>
        <div class="zfile-video-tools-item" @click="openTarget('thunder')">
          <el-tooltip placement="top">
            <template #content>
              使用迅雷下载
            </template>
            <img src="../../../assets/image/video-thunder.png" alt="迅雷">
          </el-tooltip>
        </div>
        <div class="zfile-video-tools-item" @click="openTarget('motrix')">
          <el-tooltip placement="top">
            <template #content>
              使用 motrix 下载
            </template>
            <img src="../../../assets/image/video-motrix.png" alt="motrix">
          </el-tooltip>
        </div>
      </template>
			<div class="zfile-video-tools-item" @click="openTarget('potplayer')">
				<el-tooltip placement="top">
					<template #content>
						使用 PotPlayer 播放
					</template>
					<img src="../../../assets/image/video-potplayer.png" alt="PotPlayer">
				</el-tooltip>
			</div>
			<div class="zfile-video-tools-item" @click="openTarget('iina')">
				<el-tooltip placement="top">
					<template #content>
						使用 IINA 播放
					</template>
					<img src="../../../assets/image/video-iina.png" alt="IINA">
				</el-tooltip>
			</div>
			<div class="zfile-video-tools-item" @click="openTarget('vlc')">
				<el-tooltip placement="top">
					<template #content>
						使用 VLC 播放
					</template>
					<img src="../../../assets/image/video-vlc.png" alt="VLC">
				</el-tooltip>
			</div>
			<div class="zfile-video-tools-item" @click="openTarget('nplayer')">
				<el-tooltip placement="top">
					<template #content>
						使用 nPlayer 播放
					</template>
					<img src="../../../assets/image/video-nplayer.png" alt="nPlayer">
				</el-tooltip>
			</div>
			<div class="zfile-video-tools-item" @click="openTarget('mxplayer')">
				<el-tooltip placement="top">
					<template #content>
						使用 MXPlayer(Free) 播放
					</template>
					<img src="../../../assets/image/video-mxplayer.png" alt="MXPlayer(Free)">
				</el-tooltip>
			</div>
			<div class="zfile-video-tools-item" @click="openTarget('mxplayer-pro')">
				<el-tooltip placement="top">
					<template #content>
						使用 MXPlayer(Pro) 播放
					</template>
					<img src="../../../assets/image/video-mxplayer-pro.png" alt="MXPlayer(Pro)">
				</el-tooltip>
			</div>
		</div>
		<div class="zfile-video-tools-tips" :class="hiddenTools ? 'hidden-important' : ''">
			tips: 可点击上方的软件图标进行下载播放, 本地播放器解码效果更佳.
		</div>
	</div>
</template>

<script setup>
import Mpegts from "mpegts.js";
import Hls from 'hls.js/dist/hls.light.min';
import Artplayer from "artplayer";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { isMobile, getFileName } from "~/utils";

import IconPrev from '~icons/material-symbols/skip-previous';
import IconNext from '~icons/material-symbols/skip-next';

import useRouterData from "~/composables/useRouterData";
let { storageKey } = useRouterData();

import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

import useStorageConfigStore from "~/stores/storage-config";
let storageConfigStore = useStorageConfigStore();

let route = useRoute();

let hiddenIcon = '<i class="art-icon art-icon-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="m16.1 13.3l-1.45-1.45q.225-1.175-.675-2.2t-2.325-.8L10.2 7.4q.425-.2.863-.3T12 7q1.875 0 3.188 1.313T16.5 11.5q0 .5-.1.938t-.3.862Zm3.2 3.15l-1.45-1.4q.95-.725 1.688-1.587T20.8 11.5q-1.25-2.525-3.588-4.013T12 6q-.725 0-1.425.1T9.2 6.4L7.65 4.85q1.025-.425 2.1-.638T12 4q3.775 0 6.725 2.087T23 11.5q-.575 1.475-1.513 2.738T19.3 16.45Zm.5 6.15l-4.2-4.15q-.875.275-1.762.413T12 19q-3.775 0-6.725-2.087T1 11.5q.525-1.325 1.325-2.463T4.15 7L1.4 4.2l1.4-1.4l18.4 18.4l-1.4 1.4ZM5.55 8.4q-.725.65-1.325 1.425T3.2 11.5q1.25 2.525 3.588 4.013T12 17q.5 0 .975-.063t.975-.137l-.9-.95q-.275.075-.525.113T12 16q-1.875 0-3.188-1.312T7.5 11.5q0-.275.038-.525t.112-.525L5.55 8.4Zm7.975 2.325ZM9.75 12.6Z"/></svg></i>';
let notHiddenIcon = '<i class="art-icon art-icon-not-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="M12 16q1.875 0 3.188-1.313T16.5 11.5q0-1.875-1.313-3.188T12 7q-1.875 0-3.188 1.313T7.5 11.5q0 1.875 1.313 3.188T12 16Zm0-1.8q-1.125 0-1.913-.788T9.3 11.5q0-1.125.788-1.913T12 8.8q1.125 0 1.913.788T14.7 11.5q0 1.125-.787 1.913T12 14.2Zm0 4.8q-3.65 0-6.65-2.038T1 11.5q1.35-3.425 4.35-5.463T12 4q3.65 0 6.65 2.038T23 11.5q-1.35 3.425-4.35 5.463T12 19Zm0-7.5Zm0 5.5q2.825 0 5.188-1.488T20.8 11.5q-1.25-2.525-3.613-4.013T12 6Q9.175 6 6.812 7.488T3.2 11.5q1.25 2.525 3.613 4.013T12 17Z"/></svg></i>';
let videoListIcon = '<i class="art-icon art-icon-video-list"><svg t="1650551038453" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12028" width="20" height="20"><path d="M111.395066 179.64038l801.208844 0 0 87.866187-801.208844 0 0-87.866187Z" p-id="12029"></path><path d="M111.395066 468.067418l801.208844 0 0 87.866187-801.208844 0 0-87.866187Z" p-id="12030"></path><path d="M111.395066 756.493433l801.208844 0 0 87.866187-801.208844 0 0-87.866187Z" p-id="12031"></path></svg></i>';
let subtitleIcon = '<i class="art-icon art-icon-subtitle"><svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 48 48">\n' +
	'    <path d="M0 0h48v48H0z" fill="none"></path>\n' +
	'    <path d="M40 8H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zM8 24h8v4H8v-4zm20 12H8v-4h20v4zm12 0h-8v-4h8v4zm0-8H20v-4h20v4z"></path>\n' +
	'</svg></i>';

let nextVideoIcon = '<i class="art-icon art-icon-prev-video"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></i>';
let prevVideoIcon = '<i class="art-icon art-icon-next-video"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></i>';

const autoPlayNextVideo = useStorage('zfile-video-auto-player-next', false);
const autoPlayVideo = useStorage('zfile-video-auto-player', false);
const hiddenTools = useStorage('zfile-video-hiddle-tools', false);

let art = null;
let hlsInstance = null;
let currentVideo = ref(null);
const initArtPlayer = async (name, url) => {
  currentVideo.value = {
    name,
    url
  }
  document.querySelector(".zfile-video-player-dialog .z-dialog-title").innerHTML = name;
  if (art) {
    art.destroy();
  }

  let videoType = 'mp4';

  if (name.toLowerCase().endsWith('flv')) {
    videoType = 'flv';
  } else if (name.toLowerCase().endsWith('m3u8')) {
    videoType = 'm3u8';
  }

  let options = {
    container: '.artplayer-app',
    title: name,
    url: currentVideo.value.url,
    type: videoType,
    setting: true,
    playbackRate: true,
    flip: true,
    fullscreen: true,
    fastForward: true,
    autoOrientation: true,
    aspectRatio: true,
    fullscreenWeb: true,
    theme: '#23ade5',
    lock: true,
    subtitleOffset: true,
    miniProgressBar: true,
    autoplay: autoPlayVideo.value,
    whitelist: ['*'],
    airplay: true,
    moreVideoAttr: {
      'x5-video-player-type': 'h5',
      'x5-video-player-fullscreen': false,
      'x5-video-orientation': 'portraint',
      preload: "metadata",
      crossOrigin: 'anonymous',
    },
    customType: {
      flv: function(video, url) {
        if (Mpegts.isSupported()) {
          const flvPlayer = Mpegts.createPlayer({
            type: 'flv',
            url: url,
          });
          flvPlayer.attachMediaElement(video);
          flvPlayer.load();
        } else {
          art.notice.show = '不支持播放格式：flv';
        }
      },
      m3u8: function(video, url) {
        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            xhrSetup: (xhr, hlsUrl) => {
              // 根据 URL 获取文件名
              let fileName = getFileName(hlsUrl);
              // 如果不是当前的视频 URL, 那就是切片的 URL.
              if (hlsUrl !== url) {
                let realUrl = fileDataStore.getFileUrlByName(fileName);
                if (realUrl) {
                  xhr.open('GET', realUrl, true);
                } else {
                  xhr.open('GET', hlsUrl, true);
                }
              }
            }
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          const canPlay = video.canPlayType('application/vnd.apple.mpegurl');
          if (canPlay === 'probably' || canPlay == 'maybe') {
            video.src = url;
          } else {
            art.notice.show = '不支持播放格式：m3u8';
          }
        }
      },
    },
    contextmenu: storageConfigStore.folderConfig.permission.download ? [
      {
        html: '下载',
        click: function() {
          window.open(url);
        },
      },
    ] : [],
    settings: [
      {
        html: '自动播放',
        tooltip: autoPlayVideo.value ? '开启' : '关闭',
        icon: '<img width="22" heigth="22" src="data:image/svg+xml;base64,Cjxzdmcgdmlld0JveD0iMCAwIDgwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48ZGVmcz48cGF0aCBpZD0icGlkLTY0LXN2Z28tYSIgZD0iTTAgMGg4MHY4MEgweiI+PC9wYXRoPjxwYXRoIGQ9Ik01Mi41NDYgOC4wMTRhMy45OTggMy45OTggMCAwMTQuMjIyIDMuMDc3Yy4xMDQuNDQ2LjA5My44MDguMDM5IDEuMTM4YTIuNzQgMi43NCAwIDAxLS4zMTIuODgxYy0uMDczLjEzMi0uMTYuMjU0LS4yNDYuMzc2bC0uMjU3LjM2Ni0uNTIxLjczYy0uNy45NjktMS40MTUgMS45MjYtMi4xNTQgMi44NjZsLS4wMTUuMDJhMjQwLjk0NSAyNDAuOTQ1IDAgMDE1Ljk4Ni4zNDFsMS42NDMuMTIzLjgyMi4wNjYuNDEuMDM0LjIwNi4wMTguMTAzLjAwOC4xMTUuMDEyYzEuMjY2LjExNiAyLjUxNi40NSAzLjY3Ny45NzVhMTEuNjYzIDExLjY2MyAwIDAxMy4xNjYgMi4xMTRjLjkzMS44NyAxLjcxOSAxLjg5NSAyLjMyMSAzLjAyMmExMS41OTUgMTEuNTk1IDAgMDExLjIyNCAzLjYxM2MuMDMuMTU3LjA0Ni4zMTYuMDY4LjQ3NGwuMDE1LjExOS4wMTMuMTEyLjAyMi4yMDYuMDg1LjgyMi4xNTkgMS42NDZjLjEgMS4wOTguMTkgMi4xOTguMjcgMy4yOTguMzE1IDQuNC40NjMgOC44MjkuMzYgMTMuMjU1YTE2Ni40ODkgMTY2LjQ4OSAwIDAxLS44NDMgMTMuMjEzYy0uMDEyLjEyNy0uMDM0LjI5Ny0uMDUzLjQ1NGE3LjU4OSA3LjU4OSAwIDAxLS4wNzIuNDc1bC0uMDQuMjM3LS4wNS4yMzZhMTEuNzYyIDExLjc2MiAwIDAxLS43NCAyLjI4NyAxMS43NTUgMTEuNzU1IDAgMDEtNS4xMTggNS41NyAxMS43MDUgMTEuNzA1IDAgMDEtMy42MjMgMS4yNjNjLS4xNTguMDI0LS4zMTYuMDUyLS40NzUuMDcybC0uNDc3LjA1My0uODIxLjA3MS0xLjY0NC4xMzRjLTEuMDk2LjA4Ni0yLjE5Mi4xNi0zLjI4OC4yM2EyNjAuMDggMjYwLjA4IDAgMDEtNi41NzguMzI1Yy04Ljc3Mi4zMjQtMTcuNTQ2LjIyLTI2LjMxMy0uMzAyYTI0Mi40NTggMjQyLjQ1OCAwIDAxLTMuMjg3LS4yMmwtMS42NDMtLjEyOS0uODIyLS4wNjktLjQxLS4wMzUtLjIwNi0uMDE4Yy0uMDY4LS4wMDYtLjEzMy0uMDEtLjIxOC0uMDJhMTEuNTY2IDExLjU2NiAwIDAxLTMuNy0uOTkyIDExLjczMiAxMS43MzIgMCAwMS01LjQ5Ny01LjE3OCAxMS43MyAxMS43MyAwIDAxLTEuMjE1LTMuNjI3Yy0uMDI0LS4xNTgtLjA1MS0uMzE2LS4wNjctLjQ3NWwtLjAyNi0uMjM4LS4wMTMtLjExOS0uMDEtLjEwMy0uMDctLjgyMy0uMTMyLTEuNjQ4YTE5MC42MzcgMTkwLjYzNyAwIDAxLS4yMi0zLjI5OGMtLjI1Ni00LjM5OS0uMzU4LTguODE3LS4yNTgtMTMuMjMzLjA5OS00LjQxMi4zNzItOC44MTEuNzg4LTEzLjE5N2ExMS42NSAxMS42NSAwIDAxMy4wMzktNi44MzUgMTEuNTg1IDExLjU4NSAwIDAxNi41NzItMy41NjNjLjE1Ny0uMDIzLjMxMi0uMDUxLjQ3LS4wN2wuNDctLjA1LjgyLS4wNyAxLjY0My0uMTNhMjI4LjQ5MyAyMjguNDkzIDAgMDE2LjY0Ny0uNDA1bC0uMDQxLS4wNWE4OC4xNDUgODguMTQ1IDAgMDEtMi4xNTQtMi44NjdsLS41Mi0uNzMtLjI1OC0uMzY2Yy0uMDg2LS4xMjItLjE3My0uMjQ0LS4yNDYtLjM3NmEyLjc0IDIuNzQgMCAwMS0uMzEyLS44ODEgMi44MDggMi44MDggMCAwMS4wNC0xLjEzOCAzLjk5OCAzLjk5OCAwIDAxNC4yMi0zLjA3NyAyLjggMi44IDAgMDExLjA5My4zMTNjLjI5NC4xNTUuNTM4LjM0Ny43NDIuNTY4LjEwMi4xMS4xOS4yMy4yOC4zNWwuMjcuMzU5LjUzMi43MmE4OC4wNTkgODguMDU5IDAgMDEyLjA2IDIuOTM2IDczLjAzNiA3My4wMzYgMCAwMTEuOTI5IDMuMDNjLjE4Ny4zMTMuMzczLjYyOC41NTYuOTQ1IDIuNzI0LS4wNDcgNS40NDctLjA1NiA4LjE3LS4wMzguNzQ4LjAwNiAxLjQ5Ni4wMTUgMi4yNDQuMDI2LjE4LS4zMTMuMzY0LS42MjQuNTQ5LS45MzRhNzMuMjgxIDczLjI4MSAwIDAxMS45My0zLjAzIDg4LjczNyA4OC43MzcgMCAwMTIuMDU5LTIuOTM1bC41MzMtLjcyLjI2OC0uMzU5Yy4wOS0uMTIuMTc5LS4yNC4yODEtLjM1YTIuOCAyLjggMCAwMTEuODM0LS44ODF6TTMwLjEzIDM0LjYzMWE0IDQgMCAwMC0uNDE4IDEuNDIgOTEuMTU3IDkxLjE1NyAwIDAwLS40NDYgOS4xMjhjMCAyLjgyOC4xMjEgNS42NTYuMzY0IDguNDgzbC4xMSAxLjIxMmE0IDQgMCAwMDUuODU4IDMuMTQzYzIuODItMS40OTggNS41NS0zLjAzMyA4LjE5My00LjYwNmExNzcuNDEgMTc3LjQxIDAgMDA1Ljg5Ni0zLjY2NmwxLjQzNC0uOTQyYTQgNCAwIDAwLjA0Ny02LjYzMiAxMzcuNzAzIDEzNy43MDMgMCAwMC03LjM3Ny00LjcwOCAxNDYuODggMTQ2Ljg4IDAgMDAtNi44NzktMy44NDlsLTEuNC0uNzI1YTQgNCAwIDAwLTUuMzgyIDEuNzQyeiIgaWQ9InBpZC02NC1zdmdvLWQiPjwvcGF0aD48ZmlsdGVyIHg9Ii0xNS40JSIgeT0iLTE2LjMlIiB3aWR0aD0iMTMwLjklIiBoZWlnaHQ9IjEzMi41JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0icGlkLTY0LXN2Z28tYyI+PGZlT2Zmc2V0IGR5PSIyIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIj48L2ZlT2Zmc2V0PjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEiIGluPSJzaGFkb3dPZmZzZXRPdXRlcjEiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMSI+PC9mZUdhdXNzaWFuQmx1cj48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuMyAwIiBpbj0ic2hhZG93Qmx1ck91dGVyMSIgcmVzdWx0PSJzaGFkb3dNYXRyaXhPdXRlcjEiPjwvZmVDb2xvck1hdHJpeD48ZmVPZmZzZXQgaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9InNoYWRvd09mZnNldE91dGVyMiI+PC9mZU9mZnNldD48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzLjUiIGluPSJzaGFkb3dPZmZzZXRPdXRlcjIiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMiI+PC9mZUdhdXNzaWFuQmx1cj48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuMiAwIiBpbj0ic2hhZG93Qmx1ck91dGVyMiIgcmVzdWx0PSJzaGFkb3dNYXRyaXhPdXRlcjIiPjwvZmVDb2xvck1hdHJpeD48ZmVNZXJnZT48ZmVNZXJnZU5vZGUgaW49InNoYWRvd01hdHJpeE91dGVyMSI+PC9mZU1lcmdlTm9kZT48ZmVNZXJnZU5vZGUgaW49InNoYWRvd01hdHJpeE91dGVyMiI+PC9mZU1lcmdlTm9kZT48L2ZlTWVyZ2U+PC9maWx0ZXI+PC9kZWZzPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjgiPjxtYXNrIGlkPSJwaWQtNjQtc3Znby1iIiBmaWxsPSIjZmZmIj48dXNlIHhsaW5rOmhyZWY9IiNwaWQtNjQtc3Znby1hIj48L3VzZT48L21hc2s+PGcgbWFzaz0idXJsKCNwaWQtNjQtc3Znby1iKSI+PHVzZSBmaWxsPSIjMDAwIiBmaWx0ZXI9InVybCgjcGlkLTY0LXN2Z28tYykiIHhsaW5rOmhyZWY9IiNwaWQtNjQtc3Znby1kIj48L3VzZT48dXNlIGZpbGw9IiNGRkYiIHhsaW5rOmhyZWY9IiNwaWQtNjQtc3Znby1kIj48L3VzZT48L2c+PC9nPjwvc3ZnPg==">',
        switch: autoPlayVideo.value,
        onSwitch: function(item, $dom, event) {
          const nextState = !item.switch;

          autoPlayVideo.value = nextState;
          art.autoplay = nextState;
          // 改变提示文本
          item.tooltip = nextState ? '开启' : '关闭';

          // 改变按钮状态
          return nextState;
        },
      },
      {
        html: '自动播放下一个视频',
        tooltip: autoPlayNextVideo.value ? '开启' : '关闭',
        icon: '<img width="22" heigth="22" src="data:image/svg+xml;base64,Cjxzdmcgdmlld0JveD0iMCAwIDgwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48ZGVmcz48cGF0aCBpZD0icGlkLTY0LXN2Z28tYSIgZD0iTTAgMGg4MHY4MEgweiI+PC9wYXRoPjxwYXRoIGQ9Ik01Mi41NDYgOC4wMTRhMy45OTggMy45OTggMCAwMTQuMjIyIDMuMDc3Yy4xMDQuNDQ2LjA5My44MDguMDM5IDEuMTM4YTIuNzQgMi43NCAwIDAxLS4zMTIuODgxYy0uMDczLjEzMi0uMTYuMjU0LS4yNDYuMzc2bC0uMjU3LjM2Ni0uNTIxLjczYy0uNy45NjktMS40MTUgMS45MjYtMi4xNTQgMi44NjZsLS4wMTUuMDJhMjQwLjk0NSAyNDAuOTQ1IDAgMDE1Ljk4Ni4zNDFsMS42NDMuMTIzLjgyMi4wNjYuNDEuMDM0LjIwNi4wMTguMTAzLjAwOC4xMTUuMDEyYzEuMjY2LjExNiAyLjUxNi40NSAzLjY3Ny45NzVhMTEuNjYzIDExLjY2MyAwIDAxMy4xNjYgMi4xMTRjLjkzMS44NyAxLjcxOSAxLjg5NSAyLjMyMSAzLjAyMmExMS41OTUgMTEuNTk1IDAgMDExLjIyNCAzLjYxM2MuMDMuMTU3LjA0Ni4zMTYuMDY4LjQ3NGwuMDE1LjExOS4wMTMuMTEyLjAyMi4yMDYuMDg1LjgyMi4xNTkgMS42NDZjLjEgMS4wOTguMTkgMi4xOTguMjcgMy4yOTguMzE1IDQuNC40NjMgOC44MjkuMzYgMTMuMjU1YTE2Ni40ODkgMTY2LjQ4OSAwIDAxLS44NDMgMTMuMjEzYy0uMDEyLjEyNy0uMDM0LjI5Ny0uMDUzLjQ1NGE3LjU4OSA3LjU4OSAwIDAxLS4wNzIuNDc1bC0uMDQuMjM3LS4wNS4yMzZhMTEuNzYyIDExLjc2MiAwIDAxLS43NCAyLjI4NyAxMS43NTUgMTEuNzU1IDAgMDEtNS4xMTggNS41NyAxMS43MDUgMTEuNzA1IDAgMDEtMy42MjMgMS4yNjNjLS4xNTguMDI0LS4zMTYuMDUyLS40NzUuMDcybC0uNDc3LjA1My0uODIxLjA3MS0xLjY0NC4xMzRjLTEuMDk2LjA4Ni0yLjE5Mi4xNi0zLjI4OC4yM2EyNjAuMDggMjYwLjA4IDAgMDEtNi41NzguMzI1Yy04Ljc3Mi4zMjQtMTcuNTQ2LjIyLTI2LjMxMy0uMzAyYTI0Mi40NTggMjQyLjQ1OCAwIDAxLTMuMjg3LS4yMmwtMS42NDMtLjEyOS0uODIyLS4wNjktLjQxLS4wMzUtLjIwNi0uMDE4Yy0uMDY4LS4wMDYtLjEzMy0uMDEtLjIxOC0uMDJhMTEuNTY2IDExLjU2NiAwIDAxLTMuNy0uOTkyIDExLjczMiAxMS43MzIgMCAwMS01LjQ5Ny01LjE3OCAxMS43MyAxMS43MyAwIDAxLTEuMjE1LTMuNjI3Yy0uMDI0LS4xNTgtLjA1MS0uMzE2LS4wNjctLjQ3NWwtLjAyNi0uMjM4LS4wMTMtLjExOS0uMDEtLjEwMy0uMDctLjgyMy0uMTMyLTEuNjQ4YTE5MC42MzcgMTkwLjYzNyAwIDAxLS4yMi0zLjI5OGMtLjI1Ni00LjM5OS0uMzU4LTguODE3LS4yNTgtMTMuMjMzLjA5OS00LjQxMi4zNzItOC44MTEuNzg4LTEzLjE5N2ExMS42NSAxMS42NSAwIDAxMy4wMzktNi44MzUgMTEuNTg1IDExLjU4NSAwIDAxNi41NzItMy41NjNjLjE1Ny0uMDIzLjMxMi0uMDUxLjQ3LS4wN2wuNDctLjA1LjgyLS4wNyAxLjY0My0uMTNhMjI4LjQ5MyAyMjguNDkzIDAgMDE2LjY0Ny0uNDA1bC0uMDQxLS4wNWE4OC4xNDUgODguMTQ1IDAgMDEtMi4xNTQtMi44NjdsLS41Mi0uNzMtLjI1OC0uMzY2Yy0uMDg2LS4xMjItLjE3My0uMjQ0LS4yNDYtLjM3NmEyLjc0IDIuNzQgMCAwMS0uMzEyLS44ODEgMi44MDggMi44MDggMCAwMS4wNC0xLjEzOCAzLjk5OCAzLjk5OCAwIDAxNC4yMi0zLjA3NyAyLjggMi44IDAgMDExLjA5My4zMTNjLjI5NC4xNTUuNTM4LjM0Ny43NDIuNTY4LjEwMi4xMS4xOS4yMy4yOC4zNWwuMjcuMzU5LjUzMi43MmE4OC4wNTkgODguMDU5IDAgMDEyLjA2IDIuOTM2IDczLjAzNiA3My4wMzYgMCAwMTEuOTI5IDMuMDNjLjE4Ny4zMTMuMzczLjYyOC41NTYuOTQ1IDIuNzI0LS4wNDcgNS40NDctLjA1NiA4LjE3LS4wMzguNzQ4LjAwNiAxLjQ5Ni4wMTUgMi4yNDQuMDI2LjE4LS4zMTMuMzY0LS42MjQuNTQ5LS45MzRhNzMuMjgxIDczLjI4MSAwIDAxMS45My0zLjAzIDg4LjczNyA4OC43MzcgMCAwMTIuMDU5LTIuOTM1bC41MzMtLjcyLjI2OC0uMzU5Yy4wOS0uMTIuMTc5LS4yNC4yODEtLjM1YTIuOCAyLjggMCAwMTEuODM0LS44ODF6TTMwLjEzIDM0LjYzMWE0IDQgMCAwMC0uNDE4IDEuNDIgOTEuMTU3IDkxLjE1NyAwIDAwLS40NDYgOS4xMjhjMCAyLjgyOC4xMjEgNS42NTYuMzY0IDguNDgzbC4xMSAxLjIxMmE0IDQgMCAwMDUuODU4IDMuMTQzYzIuODItMS40OTggNS41NS0zLjAzMyA4LjE5My00LjYwNmExNzcuNDEgMTc3LjQxIDAgMDA1Ljg5Ni0zLjY2NmwxLjQzNC0uOTQyYTQgNCAwIDAwLjA0Ny02LjYzMiAxMzcuNzAzIDEzNy43MDMgMCAwMC03LjM3Ny00LjcwOCAxNDYuODggMTQ2Ljg4IDAgMDAtNi44NzktMy44NDlsLTEuNC0uNzI1YTQgNCAwIDAwLTUuMzgyIDEuNzQyeiIgaWQ9InBpZC02NC1zdmdvLWQiPjwvcGF0aD48ZmlsdGVyIHg9Ii0xNS40JSIgeT0iLTE2LjMlIiB3aWR0aD0iMTMwLjklIiBoZWlnaHQ9IjEzMi41JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0icGlkLTY0LXN2Z28tYyI+PGZlT2Zmc2V0IGR5PSIyIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIj48L2ZlT2Zmc2V0PjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEiIGluPSJzaGFkb3dPZmZzZXRPdXRlcjEiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMSI+PC9mZUdhdXNzaWFuQmx1cj48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuMyAwIiBpbj0ic2hhZG93Qmx1ck91dGVyMSIgcmVzdWx0PSJzaGFkb3dNYXRyaXhPdXRlcjEiPjwvZmVDb2xvck1hdHJpeD48ZmVPZmZzZXQgaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9InNoYWRvd09mZnNldE91dGVyMiI+PC9mZU9mZnNldD48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzLjUiIGluPSJzaGFkb3dPZmZzZXRPdXRlcjIiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMiI+PC9mZUdhdXNzaWFuQmx1cj48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuMiAwIiBpbj0ic2hhZG93Qmx1ck91dGVyMiIgcmVzdWx0PSJzaGFkb3dNYXRyaXhPdXRlcjIiPjwvZmVDb2xvck1hdHJpeD48ZmVNZXJnZT48ZmVNZXJnZU5vZGUgaW49InNoYWRvd01hdHJpeE91dGVyMSI+PC9mZU1lcmdlTm9kZT48ZmVNZXJnZU5vZGUgaW49InNoYWRvd01hdHJpeE91dGVyMiI+PC9mZU1lcmdlTm9kZT48L2ZlTWVyZ2U+PC9maWx0ZXI+PC9kZWZzPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjgiPjxtYXNrIGlkPSJwaWQtNjQtc3Znby1iIiBmaWxsPSIjZmZmIj48dXNlIHhsaW5rOmhyZWY9IiNwaWQtNjQtc3Znby1hIj48L3VzZT48L21hc2s+PGcgbWFzaz0idXJsKCNwaWQtNjQtc3Znby1iKSI+PHVzZSBmaWxsPSIjMDAwIiBmaWx0ZXI9InVybCgjcGlkLTY0LXN2Z28tYykiIHhsaW5rOmhyZWY9IiNwaWQtNjQtc3Znby1kIj48L3VzZT48dXNlIGZpbGw9IiNGRkYiIHhsaW5rOmhyZWY9IiNwaWQtNjQtc3Znby1kIj48L3VzZT48L2c+PC9nPjwvc3ZnPg==">',
        switch: autoPlayNextVideo.value,
        onSwitch: function(item, $dom, event) {
          const nextState = !item.switch;

          autoPlayNextVideo.value = nextState;

          // 改变提示文本
          item.tooltip = nextState ? '开启' : '关闭';

          // 改变按钮状态
          return nextState;
        },
      }
    ],
    controls: [
      {
        name: 'video-list',
        position: 'right',
        html: videoListIcon,
        selector: getVideoList(name),
        onSelect: function(item, $dom) {
          initArtPlayer(item.html, item.url);
          return videoListIcon;
        },
      }
    ],
    plugins: []
  };

  let danmukuUrl = getDanmukuUrl(name);
  if (danmukuUrl) {
    options.plugins.push(artplayerPluginDanmuku({
      danmuku: danmukuUrl,
    }));
  }

  if (isMobile.value === false) {
    options.controls.push({
      position: 'right',
      html: hiddenTools.value ? hiddenIcon : notHiddenIcon,
      click: function (_, event) {
        hiddenTools.value = !hiddenTools.value;
        event.target.parentNode.parentNode.innerHTML = (hiddenTools.value ? hiddenIcon : notHiddenIcon);
      },
    })
  }

  let subtitles = getSubtitles(name);
  if (subtitles.length > 0) {
    // 如果字幕数量大于 1, 则支持切换字幕
    if (subtitles.length > 1) {
      options.controls.push({
        name: 'video-subtitle',
        position: 'right',
        html: subtitleIcon,
        selector: subtitles,
        onSelect: (item) => {
          if (item.html === '关闭字幕') {
            art.subtitle.show = false;
          } else {
            art.subtitle.show = true;
            art.subtitle.url = item.url;
          }
          return subtitleIcon;
        }
      })
    }
  }

  art = new Artplayer(options);

	art.on("error", () => {
		art.video.crossOrigin = null
	});

  art.on('destory', () => {
  })

  if (isMobile.value === false) {
    art.on('ready', () => {
      let prevAndNextVideo = getPrevAndNextVideo(art.option.title);
      if (prevAndNextVideo?.prev) {
        art.controls.add({
          name: 'prev-video',
          position: 'left',
          index: 5,
          tooltip: '播放上一个',
          html: prevVideoIcon,
          click: () => {
            playPrevVideo();
          }
        })
      }
      if (prevAndNextVideo?.next) {
        art.controls.add({
          name: 'next-video',
          position: 'left',
          index: 15,
          tooltip: '播放下一个',
          html: nextVideoIcon,
          click: () => {
            playNextVideo();
          }
        })
      }
    })
  }
  art.on('video:ended', () => {
    if (autoPlayNextVideo.value) {
      playNextVideo();
    }
  });

  // 默认第一个为字幕
  if (subtitles.length > 0) {
    art.subtitle.url = subtitles[0].url;
  }
}

// 获取视频列表, 如果是当前视频, 则设置为默认勾选.
const getVideoList = (currentName) => {
  let result = [];
  fileDataStore.filterFileByType('video').forEach(file => {
    result.push({
      default: file.name === currentName,
      html: file.name,
      url: file.url
    });
  });

  return result;
}

const openTarget = (mode) => {
  switch (mode) {
    case 'download':
      window.location = currentVideo.value.url;
      break;
    case 'thunder':
      window.location = `thunder://${btoa('AA' + currentVideo.value.url + 'ZZ')}`;
      break;
    case 'motrix':
      window.location = `motrix://new-task?uri=${encodeURIComponent(currentVideo.value.url)}&out=${encodeURIComponent(currentVideo.value.name)}`;
      break;
    case 'potplayer':
      window.location = `potplayer://${currentVideo.value.url}`;
      break;
    case 'iina':
      window.location = `iina://weblink?url=${encodeURIComponent(currentVideo.value.url)}`;
      break;
    case 'vlc':
      window.location = `vlc://${currentVideo.value.url}`;
      break;
    case 'nplayer':
      window.location = `nplayer-${currentVideo.value.url}`;
      break;
    case 'mxplayer':
      window.location = 'intent:' + currentVideo.value.url + '#Intent;package=com.mxtech.videoplayer.ad;S.title=' + currentVideo.value.name +';end';
      break;
    case 'mxplayer-pro':
      window.location = 'intent:' + currentVideo.value.url + '#Intent;package=com.mxtech.videoplayer.pro;S.title=' + currentVideo.value.name +';end';
      break;
  }
}

// 清楚超过进度的视频缓存, 防止再次播放时直接结束.
const clearExceedProgress = () => {
  let playProgress = JSON.parse(localStorage.getItem('_h5_player_play_progress_'));
  if (playProgress) {
    for (let key of Object.keys(playProgress)) {
      if (key.endsWith(playProgress[key].progress)) {
        delete playProgress[key];
      }
    }
    localStorage.setItem('_h5_player_play_progress_', JSON.stringify(playProgress));
  }
}

// 字幕列表, 如果是当前视频, 则设置为默认勾选.
const getSubtitles = (currentName) => {
  let subtitleList = [];
  fileDataStore.fileList.find((item) => {
    let currentNameBase = currentName.split('.')[0];
    let name = item.name;
    if (name === (currentName + ".vtt") ||
      name === (currentName + ".srt") ||
      name === (currentName + ".ass") ||
      name === (currentNameBase + ".vtt") ||
      name === (currentNameBase + ".srt") ||
      name === (currentNameBase + ".ass")) {
      subtitleList.push({
        default: subtitleList.length === 0,
        url: item.url,
        html: name
      })
    }
  });

  if (subtitleList.length > 0) {
    subtitleList.push({
      url: '',
      html: '关闭字幕'
    })
  }

  return subtitleList;
}

// 获取弹幕文件
const getDanmukuUrl = (currentName) => {
  // 查找第一个文件名是视频名.xml 的
  let file =  fileDataStore.fileList.find((item) => {
    let currentNameBase = currentName.split('.')[0];
    let name = item.name;
    if (name === (currentName + ".xml") || name === (currentNameBase + ".xml")) {
      return true;
    }
  })

  if (file) {
    return file.url;
  }
}

// 获取上一个和下一个视频, 没有则返回空
const getPrevAndNextVideo = (currentName) => {
  let videoList = fileDataStore.filterFileByType('video');

  clearExceedProgress();
  for (let i = 0; i < videoList.length; i++){
    let videoItem = videoList[i];
    if (videoItem.name === currentName) {
      return {
        prev: videoList[i - 1] || null,
        next: videoList[i + 1] || null
      }
    }
  }
}

const playNextVideo = () => {
  const nextVideo = getPrevAndNextVideo(art.option.title)?.next;
  if (nextVideo) {
    initArtPlayer(nextVideo.name, nextVideo.url);
  }
}

const playPrevVideo = () => {
  const prevVideo = getPrevAndNextVideo(art.option.title)?.prev;
  if (prevVideo) {
    initArtPlayer(prevVideo.name, prevVideo.url);
  }
}

onMounted(() => {
	initArtPlayer(fileDataStore.currentClickRow.name, fileDataStore.currentClickRow.url);
})

onUnmounted(() => {
  if (art) {
    art.destroy(true);
  }
  if (hlsInstance) {
    hlsInstance.destroy();
  }
})
</script>

<style scoped lang="scss">
.artplayer-app {
	@apply h-[40vh] md:h-[60vh] lg:h-[70vh];

  :deep(.art-controls .art-control) {
    @apply min-w-[14px] min-h-[14px] sm:min-w-[46px] sm:min-h-[46px];
    .art-icon {
      width: 28px;
    }
  }

  :deep(.art-controls-center) {
    @apply hidden sm:flex #{!important};
  }

}

.zfile-video-switch-tools {
  @apply px-5 py-2 bg-gray-50 flex justify-between;
}
.zfile-video-tools {
	@apply bg-gray-50 p-3
        grid grid-cols-3 gap-0
        sm:space-x-10 sm:flex sm:justify-center sm:flex-wrap;

	.zfile-video-tools-item {
		@apply bg-white shadow hover:shadow-2xl m-2 px-2 py-1 rounded-md flex-shrink-0 cursor-pointer text-center;

		img {
			@apply w-8 h-8 inline;
		}
	}
}

.zfile-video-tools-tips {
	@apply bg-gray-50 text-center pb-2 text-gray-500 text-sm;
}
</style>