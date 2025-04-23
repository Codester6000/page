import { Box, Typography, Stack, Link } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "#FF7d21", py: 3 }}>
      <Stack spacing={1} alignItems="center">
        <Typography variant="body1" color="white">
          Bazán y Bustos Esquina 25 de Mayo, F5300 La Rioja - 3804353826
        </Typography>
        <Typography variant="body1" color="white">
          modex.larioja@gmail.com
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <InstagramIcon sx={{ color: "white" }} />
          <Link
            href="https://instagram.com/modex.lr"
            target="_blank"
            rel="noopener"
            underline="hover"
            color="white"
          >
            @modex.lr
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Footer;
