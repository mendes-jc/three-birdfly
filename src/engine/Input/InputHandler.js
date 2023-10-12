class InputHandler {
    static onKeyDown(keyCode, action) {
        document.addEventListener("keydown", event => {
            if (event.key === keyCode) {
                action?.();
            }
        })
    }

    static onKeyUp(keyCode, action) {
        document.addEventListener("keyup", event => {
            if (event.key === keyCode) {
                action?.();
            }
        })
    }
}

export default InputHandler;