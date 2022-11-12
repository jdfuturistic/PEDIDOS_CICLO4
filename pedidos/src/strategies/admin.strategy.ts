import { AuthenticationStrategy } from "@loopback/authentication";
import { service } from "@loopback/core";
import { Request, RedirectRoute, HttpErrors } from "@loopback/rest";
import { UserProfile } from "@loopback/security";
import { serviceProxy } from "@loopback/service-proxy";
import { ParamsDictionary } from "express-serve-static-core";
//import { ParamsDictionary } from "express";
import parseBearerToken from "parse-bearer-token";
import { AutenticacionService } from "../services";

export class EstrategiaAdministrador implements AuthenticationStrategy{
    name: string = 'admin';

    constructor(
        @service(AutenticacionService)
        public servicioAutenticacion : AutenticacionService
    ){}

    async authenticate(request: Request): Promise<UserProfile | undefined>{
        let token = parseBearerToken(request);
        if(token){
            let datos = this.servicioAutenticacion.ValidarTokenJWT(token)
            if(datos){
                let perfil: UserProfile = Object.assign({
                    nombre: datos.data.nombre
                });
                return perfil;
            }else{
                throw new HttpErrors[401]('El token estaba malo')
            }
        }else{
            throw new HttpErrors[401]('No se incluyó token')
        }
    }
}