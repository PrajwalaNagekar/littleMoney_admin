import personalLoanModal from "../models/personalLoan.modal";

export const getPersonalDetailsById = async (req, res) => {
    const { leadId } = req.params;
    console.log("🚀 ~ getPersonalDetailsById ~ leadId:", leadId)
    try {
      const lead = await personalLoanModal.findOne({ leadId }); //  Here
  
      console.log("🚀 ~ getPersonalDetailsById ~ lead:", lead)
      if (!lead) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
  
      return res.status(200).json(lead);
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };