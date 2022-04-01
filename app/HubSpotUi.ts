import config from "./hubSpotConfig.json"

export class HubSpotUi {
  public static createForm(onSubmit) {
    const forms = window["hbspt"].forms;

    forms.create(config);

    window.addEventListener("message", (event) => {
      if (
        event.data.type === "hsFormCallback" &&
        event.data.eventName === "onFormSubmit"
      ) {
        onSubmit(event);
      }
    });
  }

  public static hideForm() {
    document.getElementById("signup-form").style.display = "none";
  }
}
