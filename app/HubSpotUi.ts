export class HubSpotUi {
    public static createForm(onSubmit) {
        const forms = window['hbspt'].forms;

        forms.create({
            region: "na1",
            portalId: "6939709",
            formId: "03db866f-1346-4e21-9924-def48cd70e79",
            target: '#signup-form',
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
