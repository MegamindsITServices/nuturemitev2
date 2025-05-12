import express from 'express';
import { addToCart, clearCart, getCart, removeFromCart } from '../controller/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/add-cart', addToCart)
cartRouter.post('/get-cart', getCart);
cartRouter.delete('/remove-cart', removeFromCart);
cartRouter.post('/clear', clearCart);




export default cartRouter;