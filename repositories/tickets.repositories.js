class TicketsRepository {
    constructor(dao) {
      this.dao = dao;
    }
  
    createTicket = async ({ amount }) => {
      return await this.dao.createTicket({ amount });
    };
  }
  
  export default TicketsRepository;
  