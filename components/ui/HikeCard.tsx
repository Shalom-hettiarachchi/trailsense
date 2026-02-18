import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

interface HikeCardProps {
  id: string;
  name: string;
  image: string;
  location: string;
  difficulty: "Easy" | "Moderate" | "Hard" | "Expert";
  duration: string;
  description: string;
}

const difficultyColors: Record<HikeCardProps["difficulty"], string> = {
  Easy: "bg-accent text-accent-foreground",
  Moderate: "bg-primary/20 text-primary",
  Hard: "bg-destructive/20 text-destructive",
  Expert: "bg-destructive text-destructive-foreground",
};

export default function HikeCard({
  id,
  name,
  image,
  location,
  difficulty,
  duration,
  description,
}: HikeCardProps) {
  return (
    <Card className="group overflow-hidden border border-border shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <Badge className={`absolute top-4 left-4 ${difficultyColors[difficulty]}`}>
          {difficulty}
        </Badge>
      </div>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button variant="adventure" className="w-full" asChild>
          <Link href={`/hikes/${id}`}>Explore Trail</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
