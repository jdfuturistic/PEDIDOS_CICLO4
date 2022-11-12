import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { Persona } from '../models';
import { PersonaRepository } from '../repositories';
import { Llaves } from '../config/llaves';

const generador = require('password-generator');
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository
  ) {}

  /*
   * Add service methods here
   */

  // Método para generar la clave y retornarla
GenerarClave(){
  let clave = generador(8,false);     //la variable clave se genera automaticamente con generador, de 8 caracteres pero no está encriptada. false no es tan seguro
  return clave;
}

  // Metodo para encriptar las claves con MD5. Recibe la clave y la encripta
CifrarClave(clave:string){
  let claveCifrada = cryptoJS.MD5(clave).toString();     //El método cryptoJS.MD5 nos cifra la clave pero en texto crudo, le ponemos tostring() para convertirla en cadena y eso es la clave cifrada
  return claveCifrada;
}

  // Método para autenticar, es decir identificar persona. El usuario ingresa usu y clave y esa clave la ciframos MD5 para poderla comparar con la clave que esta em BD
IdentificarPersona(usuario: string, clave: string){
  try{
    let p = this.personaRepository.findOne({where: {correo: usuario, clave: clave}}); //encuentre uno donde correo sea igual al usuario que digitó y la clave sea igual a clave que digitó
    if(p){   //si hay una p con todos los datos de la persona, es decir si la encontró entonces la retorna
      return p;
    } 
    return false;  //si no, retorna false, es decir, no la encontró
  }catch{
    return false;
  }
}

  // Método que genera token
GenerarTokenJWT(persona: Persona){
  let token = jwt.sign({
    data: {
      id: persona.id,
      correo: persona.correo,
      nombre: persona.nombres
    }
  },
  Llaves.claveJWT);
  return token;
}

  //Validar token
ValidarTokenJWT(token: string){
  try{
    let datos = jwt.verify(token, Llaves.claveJWT);
    return datos;
  }catch{
    return false;
  }
}
}
