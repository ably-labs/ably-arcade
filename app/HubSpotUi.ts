export class HubSpotUi {
    public static createForm(onSubmit) {
        const forms = window['hbspt'].forms;

        forms.create({
          region: "na1",
          portalId: "6939709",
          formId: "f8095b78-3876-4595-be1c-ec04d3789d5a",
          target: "#signup-form"
        });

        window.addEventListener('message', event => {
            if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmit') {
                onSubmit(event);
            }
        });
    }

    public static hideForm() {
        document.getElementById("signup-form").style.display = "none";
    }
}
