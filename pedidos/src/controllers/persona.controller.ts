import { authenticate } from '@loopback/authentication';
import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Credenciales, Persona} from '../models';
import {PersonaRepository} from '../repositories';
import { AutenticacionService } from '../services';
const fetch = require('node-fetch');

//@authenticate('admin')
export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) {}

  //@authenticate.skip()
    //Creamos este post
  @post('/identificarPersona',{
    responses:{
      '200':{
        description:'Identificación de usuarios'
      }
    }
  })
  async identificarPersona(
    @requestBody() credenciales : Credenciales
  ){
    let p = await this.servicioAutenticacion.IdentificarPersona(credenciales.usuario, credenciales.clave);
    if(p){
      let token = this.servicioAutenticacion.GenerarTokenJWT(p);
      return{
        datos:{
          nombre: p.nombres,
          correo: p.correo,
          id: p.id
        },
        tk: token
      }
    }else{
      throw new HttpErrors[401]('Datos inválidos');
    }
  }

  //@authenticate('admin')
  @post('/personas')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
  ): Promise<Persona> {
      //definimos clave y le asignamos los 8 dígitos que devuelve el metodo GenerarClave() el cual llamamos con this.servicioAutenticacion
    let clave = this.servicioAutenticacion.GenerarClave();    
      
      //vamos a cifrarla, definimos claveCifrada y le asignamos la clave cifrada que devuelve el método CifrarClave(clave) el cual recibe la clave de la linea anterior
    let claveCifrada = this.servicioAutenticacion.CifrarClave(clave);  
    
      //A la entidad persona en el atributo clave le voy a asignar la clave pero cifrada
    persona.clave = claveCifrada;

      //return this.personaRepository.create(persona); 
    let p = await this.personaRepository.create(persona);  //Ponemos a esperar mientras se crea la clave y se cifra

      //Notificar al usuario por correo
    let destino = persona.correo;
    let asunto = 'Datos de registro en la plataforma';
    let contenido = `Hola ${persona.nombres} bienvenido a la plataforma de pedidos, su usuario es ${persona.correo} y su contraseña es ${clave}`; //esta comilla inclinada se saca con Ctrl + Alt + }
    fetch(`http://127.0.0.1:5000/email?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
      .then((data:any)=>{
        console.log(data);
      })
      //return p;
    
    let destino_sms = persona.celular;
    fetch(`http://127.0.0.1:5000/mensajetxt?celular_destino=${destino_sms}&contenido=${contenido}`)
      .then((data:any)=>{
        console.log(data);
      })
      return p;
  }
  
  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'}) filter?: FilterExcludingWhere<Persona>
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }
}
