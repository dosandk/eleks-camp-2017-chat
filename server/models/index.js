import mongoose from 'mongoose';

export default mongoose.model('Users', new mongoose.Schema({
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  }
}));
