const svgCss = `
:host {
      display: block;
    }

div.svg-container {
    position: relative;
    min-height: 50px;
}

.svg-object {
  margin: 0;
  position: absolute;
  max-height: 90%;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
`
export { svgCss }