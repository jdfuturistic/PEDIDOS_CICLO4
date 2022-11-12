// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
'use strict'

// Fetch all the forms we want to apply custom Bootstrap validation styles to
var forms = document.querySelectorAll('.needs-validation')

// Loop over them and prevent submission
Array.prototype.slice.call(forms)
.forEach(function (form) {
form.addEventListener('submit', function (event) {
if (!form.checkValidity()) {
  event.preventDefault()
  event.stopPropagation()
}else{
    RegistrarPersona();
        //detener la ejecución del formulario a través de la funcion preventDefault()
    event.preventDefault()
}

form.classList.add('was-validated')
}, false)
})
})()

function RegistrarPersona(){
    //alert("Todo está bien");
    let nombres = document.querySelector("#txtNombres").value;
    let apellidos = document.querySelector("#txtApellidos").value;
    let correo = document.querySelector("#txtCorreo").value;
    let celular = document.querySelector("#txtCelular").value;

    let url = `http://localhost:3000/personas`;
    let datos = {
        nombres: nombres,
        apellidos: apellidos,
        correo: correo,
        celular: celular
    };
                                                //fetch envia la información a loopback
    fetch(url, {                                //le enviamos la url y un objeto con toda la información de la request
        method: 'POST',                         //le indicamos el método POST
        body: JSON.stringify(datos),           //El body corresponde a los datos que he definido. Convierte en cadena de texto la información que está en JSON
        headers:{                              // El header corresponde al tipo de dato que voy a enviar y algunos otros datos que pueda enviar en los encabezados de la solicitud
            'Content-Type':'application/json'   //en este caso el tipo de contenido corresponde a una información en formato JSON la cual está almacenada en la variable datos
        } 
    }).then(res => res.json())
    .then(mensaje => {
        console.log(mensaje)
    })
}