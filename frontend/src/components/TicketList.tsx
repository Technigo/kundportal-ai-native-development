function TicketList() {
  return (
    <div>
      <h2>Ärendelista</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kundnamn</th>
            <th>Rubrik</th>
            <th>Status</th>
            <th>Prioritet</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1</td>
            <td>Anna Andersson</td>
            <td>Problem med faktura</td>
            <td>Nytt</td>
            <td>Hög</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default TicketList;