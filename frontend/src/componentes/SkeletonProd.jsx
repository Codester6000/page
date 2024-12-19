import Grid from "@mui/joy/Grid";
import { Card, CardContent, Skeleton, Typography } from "@mui/material";

export default function SkeletonProd(){

    return(
    <Grid container spacing={5} style={{ marginTop: "20px" }}>
        {Array.from(new Array(8)).map((_, index) => (
            <Grid xs={12} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ width: 280, bgcolor: "#e0e0e0", height: 350 }}>
                    <Skeleton variant="rectangular" width={280} height={140} sx={{my: "15px", mx: "15px"}}/>
                    <CardContent orientation="horizontal" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div>
                            <Typography level="h4" sx={{ display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, textOverflow: "ellipsis", fontWeight: "bold" }}>
                                <Skeleton width="80%" />
                            </Typography>
                            <Typography>
                                <Skeleton width="60%" />
                            </Typography>
                            <Typography level="h3" sx={{ fontWeight: "xl", mt: 0.8 }}>
                                <Skeleton width="50%" />
                            </Typography>
                            <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                                <Skeleton variant="rectangular" width={100} height={45} sx={{ borderRadius: "20px", marginRight: 2 }} />
                                <Skeleton variant="circular" width={45} height={45} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        ))}
    </Grid>
)    
}
