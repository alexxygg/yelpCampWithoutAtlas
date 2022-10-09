(() => {
  "use strict";

  //THIS IS FOR THE CUSTOM INPUT FILE UPLOAD BOOTSTRAP
  //We had to include a script with src of the link for
  //Bs Custom File Input
  bsCustomFileInput.init();

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
