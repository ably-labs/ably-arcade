export class HubSpotUi {
    public static createForm(onSubmit) {
        const forms = window['hbspt'].forms;

        forms.create({
          region: "na1",
          portalId: "6939709",
          formId: "691826da-f832-4c82-865c-aeed2ae9fe54",
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
