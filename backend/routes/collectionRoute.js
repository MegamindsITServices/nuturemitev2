import express from 'express';
import { collectionController, deleteCollection, getAllCollections, getCollectionById, updateCollection } from '../controller/collectionController.js';

const collectionRouter = express.Router();

collectionRouter.post('/add-collection', collectionController)
collectionRouter.get('/get-collection', getAllCollections)
collectionRouter.get('/get-collection/:id', getCollectionById)
collectionRouter.put('/update-collection/:id', updateCollection )
collectionRouter.delete('/delete-collection/:id', deleteCollection )

export default collectionRouter;