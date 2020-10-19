import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';
import OrphanageView from '../views/orphanages_view';

export default {
  async index(req: Request, res: Response){
    const repository = getRepository(Orphanage);

    const orphanages = await repository.find({
      relations: ['images'],
    });

    return res.json(OrphanageView.renderMany(orphanages));
  },

  async show(req: Request, res: Response){
    const { id } = req.params;

    const repository = getRepository(Orphanage);

    const orphanage = await repository.findOneOrFail(id, {
      relations: ['images'],
    });

    return res.json(OrphanageView.render(orphanage));
  },
  
  async create(req: Request, res: Response){
    const orphanageRepository = getRepository(Orphanage);
  
    const requestImages = req.files as Express.Multer.File[];
    const images = requestImages.map(image => {
      return { 
        path: image.filename,
       }
    })

    const data = { ...req.body, images };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(Yup.object().shape({
        path: Yup.string().required(),
      })),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = orphanageRepository.create(data);
  
    await orphanageRepository.save(orphanage);
  
    return res.status(201).json(orphanage);
  }
};
