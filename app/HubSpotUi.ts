export class HubSpotUi {
  public static createForm(onSubmit) {
    const forms = window["hbspt"].forms;

    fetch("/hubSpotConfig.json")
      .then((r) => r.json())
      .then(forms.create);

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
