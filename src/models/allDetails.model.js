import mongoose from 'mongoose';
import personalLoanModal from './personalLoan.modal.js';
import businessLoanModal from './businessLoan.modal.js';
import registerModel from './register.model.js';
import LoginCount from './loginCount.modal.js';
import appliedCustomersModal from './appliedCustomers.modal.js';
const allDetailsSchema = new mongoose.Schema({


  leadId: {
    type: String, required: false
  },

  // References to other collections
  personalLoanRef: { type: mongoose.Schema.Types.ObjectId, ref: 'personalLoan' },
  businessLoanRef: { type: mongoose.Schema.Types.ObjectId, ref: 'businessLoan' },
  appliedCustomerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'appliedCustomer' },
  registerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'register' },
  loginCountRef: { type: mongoose.Schema.Types.ObjectId, ref: 'LoginCount' },



}, { timestamps: true });

export default mongoose.model('AllDetails', allDetailsSchema);
