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

  $.get("/session/" + id, (data) => {
      console.log(data);
  });
  
}