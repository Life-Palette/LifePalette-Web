<script setup lang="ts"></script>

<template>
  <header>
    <h1>Parallax header</h1>
    <p>Parallax scroll effect like Twitter. Pure css, javacsript free.</p>
  </header>
  <main>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi, tempora
      voluptatum porro. Harum odio, sapiente dicta, eum quidem porro atque
      quisquam impedit officia ullam minus, laudantium vel eaque doloribus rem.
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi, tempora
      voluptatum porro. Harum odio, sapiente dicta, eum quidem porro atque
      quisquam impedit officia ullam minus, laudantium vel eaque doloribus rem.
    </p>
  </main>
</template>

<style>
html {
	height: 100%;
	overflow: hidden;
}
body {
	color: #fff;
	margin: 0;
	padding: 0;
	-webkit-perspective: 1px;
	perspective: 1px;
	-webkit-transform-style: preserve-3d;
	transform-style: preserve-3d;
	height: 100%;
	overflow-y: scroll;
	overflow-x: hidden;
}
header {
	box-sizing: border-box;
	min-height: 40vw;
	padding: 30vw 0 5vw;
	position: relative;
	-webkit-transform-style: inherit;
	transform-style: inherit;
	width: 100vw;
}
header,
header:before {
	background: 50% 50% / cover;
}
header::before {
	bottom: 0;
	content: '';
	left: 0;
	position: absolute;
	right: 0;
	top: 0;
	display: block;
	background-color: #8a8;
	background-image: url(http://ksk-soft.com/css_labo/dimg/orengeFlower.jpg);
	background-size: cover;
	-webkit-transform-origin: center center 0;
	-webkit-transform: translateZ(-1px) scale(2);
	transform-origin: center center 0;
	transform: translateZ(-1px) scale(2);
	z-index: -1;
	min-height: 100vh;
}
header * {
	font-weight: normal;
	letter-spacing: 0.2em;
	text-align: center;
	margin: 0;
	padding: 1em 0;
}
header p {
	background-color: hsla(0, 0%, 100%, 0.1);
}
main {
	background-color: hsl(60, 10%, 10%);
	line-height: 1.7;
	max-width: 32em;
	padding: 5% calc(50% - 16em) 35%;
	position: relative;
	z-index: 2;
}
</style>

<route lang="json">
{
	"meta": {
		"title": "Test",
		"layout": "noCom"
	}
}
</route>
