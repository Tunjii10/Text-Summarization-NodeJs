async function myFunction() {
  try {
    // prevent default form action
    document.getElementById("form").addEventListener("click", function (event) {
      event.preventDefault();
    });

    // get post obj
    var x = document.getElementById("form").elements[0].value;
    let postObj = {
      text: x,
    };
    let post = JSON.stringify(postObj);
    const url = "http://localhost:3000/api/v1/summarize/";

    //instantiate xhr object, send post body, return summarized text
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        document.getElementById("button").innerHTML = "loading";
      }
      if (xhr.readyState === 4) {
        let response = JSON.parse(xhr.response);
        let string = "";
        for (let values of response) {
          string = string + values + " ";
          console.log(string);
        }
        document.getElementById("summary-text").classList.remove("hidden");
        document.getElementById("summary-text").innerHTML = string;
        document.getElementById("button").innerHTML = "Summarize";
      }
    };
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset = UTF_8");
    xhr.send(post);
  } catch (e) {
    throw e;
  }
}
