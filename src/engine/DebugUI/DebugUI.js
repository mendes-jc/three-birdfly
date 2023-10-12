class DebugUI {
    static labels = {};

    static addLabel(labelId, labelText) {
        const container = this.getContainer();

        const labelValueElement = this.createLabelElement(container, labelId, labelText);
        this.labels[labelId] = labelValueElement;
    }

    static updateValue(labelId, newValue) {
        if (this.labels[labelId]) this.labels[labelId].textContent = newValue;
    }

    static getContainer() {
        const container = document.querySelector(".debugger-container");
        console.log(container);
        if (container) {
            return container;
        }

        const newContainer = document.createElement("div");
        newContainer.className = "debugger-container";

        document.body.appendChild(newContainer);
        return newContainer;
    }

    static createLabelElement(container, labelId, labelText) {
        const newLabel = document.createElement("span");
        newLabel.className = "debugger-label";
        newLabel.textContent = `${labelText}: `;

        const newLabelValue = document.createElement("span");
        newLabelValue.id = labelId;

        container.appendChild(newLabel);
        container.appendChild(newLabelValue);
        container.appendChild(document.createElement("br"));

        return newLabelValue;
    }
}

export default DebugUI;