
document.addEventListener("DOMContentLoaded", function(){
    const form = document.querySelector("form");
    const input = form.querySelector("input")
    
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      console.log(input.value)
      var Public_key = (input.value).replace(/-----BEGIN PUBLIC KEY----- /g, '')
      Public_key = (Public_key).replace(/-----END PUBLIC KEY-----/g, '')
      console.log(Public_key)
      fetch('/savePublicKey',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Public_key })
      })
        .then(data => {
          console.log('Success:', data);
          if(data.ok) {
            window.location.href = '/login'
          } else {
            throw new Error(response.message)
          }
        })
    })
  })
  