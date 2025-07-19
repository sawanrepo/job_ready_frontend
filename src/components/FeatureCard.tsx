import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  actionPath: string;
  gradient?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  actionPath,
  gradient = false,
}) => {
  const navigate = useNavigate();

  return (
    <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-strong hover:-translate-y-2 ${
      gradient ? 'gradient-card border-0' : ''
    }`}>
      <CardContent className="p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3 font-poppins">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        <Button 
          onClick={() => navigate(actionPath)}
          className="w-full gradient-primary hover:shadow-glow transition-all duration-300"
        >
          {actionText}
        </Button>
      </CardContent>
    </Card>
  );
};