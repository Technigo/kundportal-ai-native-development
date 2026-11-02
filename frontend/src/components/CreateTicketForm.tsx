function CreateTicketForm() {
  return (
    <div>
      <h2>Registrera nytt ärende</h2>

      <label>Kund-ID</label>
      <input type="text" />

      <label>Kundnamn</label>
      <input type="text" />

      <label>Rubrik</label>
      <input type="text" />

      <label>Beskrivning</label>
      <textarea></textarea>

      <label>Kategori</label>
      <select>

      <option>Fakturering</option>
      <option>Teknisk support</option>
      <option>Övrigt</option>
      </select>

      <label>Prioritet</label>
      <select>

      <option>Låg</option>
      <option>Normal</option>
    
      <option>Hög</option>
      </select>
      <button>Skapa ärende</button>

    </div>  
);
}

export default CreateTicketForm;