// check if the user has already logged in before. If so, redirect the user to the appropriate dashboard.
if (getCookie("sessionID") != "") {
  switch (getCookie("status")) {
    case "member":
      window.location.href = "/member";
    case "president":
      window.location.href = "/president";
  }
}

// when user presses login, check if the name given is on the order list. If so, log them in. Otherwise, display error
function handleSubmit(event) {
  event.preventDefault();
  const id = $("#id-input").val();
  const name = $("#name-input").val();

  $.get("/session/" + id, (data) => {
      if (data.error == "No session found" || !data.speaking.order.includes(name)) {
        $("#incorrect-warning").removeAttr("hidden");
      } else {
        setCookie("sessionID", id, 1);
        setCookie("name", name, 1);
        setCookie("status", "member", 1);
        window.location.href = "/member";
      }
  });
  
}