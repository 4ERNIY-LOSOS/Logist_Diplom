import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box sx={{ mt: 10, textAlign: 'center' }}>
            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Упс! Что-то пошло не так.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Произошла непредвиденная ошибка в приложении. Мы уже работаем над её исправлением.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/'}
                fullWidth
              >
                Вернуться на главную
              </Button>
              {import.meta.env.DEV && (
                <Box sx={{ mt: 4, textAlign: 'left', bgcolor: 'grey.100', p: 2, borderRadius: 1, overflow: 'auto' }}>
                   <Typography variant="caption" component="pre">
                     {this.state.error?.toString()}
                   </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
