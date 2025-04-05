import { IAd } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MousePointerClick } from "lucide-react";
import Image from "next/image";

interface AdCardProps {
  ad: IAd;
  onEdit: (ad: IAd) => void;
  onDelete: (id: string) => void;
}

export function AdCard({ ad, onEdit, onDelete }: AdCardProps) {
  const formattedDate = new Date(ad.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Calculate click-through rate (CTR)
  const ctr =
    ad.impressions > 0
      ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
      : "0.00";

  return (
    <Card className='overflow-hidden h-full flex flex-col'>
      <div className='relative h-40'>
        <Image
          src={ad.image}
          alt={ad.title}
          fill
          className='object-cover'
        />
      </div>

      <CardContent className='pt-4 flex-grow'>
        <h3 className='text-lg font-semibold line-clamp-2 mb-1'>{ad.title}</h3>

        <div className='mt-3 space-y-2'>
          {/* Targeting info */}
          <div className='flex flex-wrap gap-1 mb-2'>
            {ad.target.categories && ad.target.categories.length > 0 && (
              <Badge
                variant='outline'
                className='text-xs'
              >
                {ad.target.categories.join(", ")}
              </Badge>
            )}

            {ad.target.tags && ad.target.tags.length > 0 && (
              <Badge
                variant='outline'
                className='text-xs'
              >
                {ad.target.tags.join(", ")}
              </Badge>
            )}

            {ad.target.location && (
              <Badge
                variant='outline'
                className='text-xs'
              >
                {ad.target.location}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className='grid grid-cols-2 gap-2 text-sm'>
            <div className='flex items-center gap-1 text-muted-foreground'>
              <Eye className='h-3.5 w-3.5' />
              <span>{ad.impressions} views</span>
            </div>

            <div className='flex items-center gap-1 text-muted-foreground'>
              <MousePointerClick className='h-3.5 w-3.5' />
              <span>{ad.clicks} clicks</span>
            </div>
          </div>

          <div className='text-sm text-muted-foreground'>
            <span className='font-medium'>{ctr}% CTR</span>
          </div>

          <div className='text-xs text-muted-foreground'>
            Created: {formattedDate}
          </div>
        </div>
      </CardContent>

      <CardFooter className='border-t p-3 pt-3 bg-muted/30'>
        <div className='flex justify-between w-full'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onEdit(ad)}
          >
            <Pencil className='h-3.5 w-3.5 mr-1' />
            Edit
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => onDelete(ad._id as string)}
            className='text-destructive hover:text-destructive'
          >
            <Trash2 className='h-3.5 w-3.5 mr-1' />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
