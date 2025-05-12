import Grid from "@mui/joy/Grid";
import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function SkeletonProd() {
  return (
    <Grid container spacing={4} sx={{ mt: 3 }}>
      {Array.from(new Array(8)).map((_, index) => (
        <Grid xs={12} sm={6} md={4} lg={3} key={index}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(4px)",
              border: "1px solid #ddd",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height={160}
              sx={{ borderRadius: "0 0 12px 12px" }}
            />
            <CardContent sx={{ p: 2 }}>
              <Skeleton
                variant="text"
                width="90%"
                height={24}
                sx={{ mb: 1, borderRadius: 2 }}
              />
              <Skeleton
                variant="text"
                width="70%"
                height={20}
                sx={{ mb: 2, borderRadius: 2 }}
              />
              <Skeleton
                variant="text"
                width="50%"
                height={24}
                sx={{ mb: 3, borderRadius: 2 }}
              />

              <Box display="flex" justifyContent="space-between">
                <Skeleton
                  variant="rounded"
                  width={100}
                  height={40}
                  sx={{ borderRadius: "20px" }}
                />
                <Skeleton variant="circular" width={40} height={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
