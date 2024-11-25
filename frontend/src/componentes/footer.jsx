import InstagramIcon from '@mui/icons-material/Instagram';
function Footer() {
    return (
        <footer style={{backgroundColor: "#FF7d21", height: "100px"}}>
        <div style={{color: "#fff", display: "flex", justifyContent: "center" , flexDirection: "column", alignItems: "center"}}>
          <div> Av. San Nicolás de Bari 743, F5300 La Rioja 3804353826</div>
          <div> modexserviciotecnico@gmail.com </div>
          <div> <InstagramIcon/> modex.lr</div>
        </div>
      </footer>
    )
}

export default Footer;