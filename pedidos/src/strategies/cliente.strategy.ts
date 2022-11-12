import { AuthenticationStrategy } from "@loopback/authentication";
import { service } from "@loopback/core";
import { HttpErrors, RedirectRoute } from "@loopback/rest";
import { UserProfile } from "@loopback/security";
import { Request } from "express";
import parseBearerToken from "parse-bearer-token";
import { AutenticacionService } from "../services";

export class EstrategiaCliente implements AuthenticationStrategy{
    name: string = 'client';

    constructor(
        @service(AutenticacionService)
        public servicioAutenticacion : AutenticacionService
    ){

    }
    async authenticate(request: Request): Promise<UserProfile | undefined> {
        let token = parseBearerToken(request);
        if(token){
            let datos = this.servicioAutenticacion.ValidarTokenJWT(token)
                //Aquí se hace la validación dependiendo del rol
                if(datos){
                    if(datos.data.rol == "client"){
                        let generaData = datos.data.nombre
                        return generaData;
                    }else{
                        throw new HttpErrors[401]('No es cliente')
                    }                
                       /* 
                        let perfil: UserProfile = Object.assign({
                        nombre: datos.data.nombre
                    });
                    return perfil;*/
                }else{
                    throw new HttpErrors[401]('El token estaba malo')
                }
    
            } else{
                throw new HttpErrors[401]('No se incluyó token')
            }        
    }
}