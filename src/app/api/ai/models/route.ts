import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface MLModel {
  id: string;
  name: string;
  type: 'demand_prediction' | 'recommendation' | 'anomaly_detection';
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  isActive: boolean;
  lastTrainedAt: string | null;
  trainingData: {
    records: number;
    dateRange: string;
  };
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
  hyperparameters: Record<string, unknown>;
}

export async function GET() {
  try {
    // Get models from database if they exist, otherwise return mock data
    const dbModels = await db.mLModel.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let models: MLModel[];

    if (dbModels.length > 0) {
      models = dbModels.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type as 'demand_prediction' | 'recommendation' | 'anomaly_detection',
        version: m.version,
        accuracy: m.accuracy || 0,
        precision: m.precision || 0,
        recall: m.recall || 0,
        f1Score: m.f1Score || 0,
        isActive: m.isActive,
        lastTrainedAt: m.lastTrainedAt?.toISOString() || null,
        trainingData: {
          records: 15000,
          dateRange: 'Last 6 months'
        },
        metrics: {
          mae: 12.5,
          rmse: 15.3,
          mape: 8.2
        },
        hyperparameters: m.hyperparameters ? JSON.parse(m.hyperparameters as string) : {}
      }));
    } else {
      // Return default models
      models = [
        {
          id: 'model-demand-001',
          name: 'Demand Forecaster v2.1',
          type: 'demand_prediction',
          version: '2.1.0',
          accuracy: 87.5,
          precision: 85.2,
          recall: 88.9,
          f1Score: 87.0,
          isActive: true,
          lastTrainedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          trainingData: {
            records: 15420,
            dateRange: 'Jan 2024 - Dec 2024'
          },
          metrics: {
            mae: 12.5,
            rmse: 15.3,
            mape: 8.2
          },
          hyperparameters: {
            learningRate: 0.001,
            epochs: 100,
            batchSize: 32,
            hiddenLayers: [128, 64, 32]
          }
        },
        {
          id: 'model-rec-001',
          name: 'Product Recommender v1.5',
          type: 'recommendation',
          version: '1.5.0',
          accuracy: 82.3,
          precision: 80.1,
          recall: 84.5,
          f1Score: 82.2,
          isActive: true,
          lastTrainedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          trainingData: {
            records: 8920,
            dateRange: 'Mar 2024 - Dec 2024'
          },
          metrics: {
            mae: 0.15,
            rmse: 0.18,
            mape: 12.5
          },
          hyperparameters: {
            embeddingDim: 64,
            numFactors: 100,
            regularization: 0.01
          }
        },
        {
          id: 'model-anomaly-001',
          name: 'Anomaly Detector v1.2',
          type: 'anomaly_detection',
          version: '1.2.0',
          accuracy: 91.2,
          precision: 89.5,
          recall: 92.8,
          f1Score: 91.1,
          isActive: true,
          lastTrainedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          trainingData: {
            records: 12500,
            dateRange: 'Feb 2024 - Dec 2024'
          },
          metrics: {
            mae: 0.08,
            rmse: 0.12,
            mape: 5.3
          },
          hyperparameters: {
            contamination: 0.1,
            nEstimators: 100,
            maxSamples: 256
          }
        }
      ];
    }

    return NextResponse.json({
      success: true,
      models,
      summary: {
        totalModels: models.length,
        activeModels: models.filter(m => m.isActive).length,
        averageAccuracy: models.reduce((sum, m) => sum + m.accuracy, 0) / Math.max(models.length, 1)
      }
    });

  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, action } = body;

    if (action === 'retrain') {
      // Simulate model retraining
      const startTime = Date.now();
      
      // In a real system, this would trigger actual ML training
      // For now, we simulate with a delay and create a new model version
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newVersion = `${Math.floor(Math.random() * 3) + 2}.${Math.floor(Math.random() * 10)}.0`;

      // Create or update model in database
      const model = await db.mLModel.create({
        data: {
          name: `Retrained Model ${new Date().toISOString().split('T')[0]}`,
          type: 'demand_prediction',
          version: newVersion,
          accuracy: 85 + Math.random() * 10,
          precision: 83 + Math.random() * 10,
          recall: 86 + Math.random() * 10,
          f1Score: 84 + Math.random() * 10,
          isActive: true,
          lastTrainedAt: new Date(),
          trainingData: 'Simulated training with recent data'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Model retraining completed',
        model: {
          id: model.id,
          version: model.version,
          accuracy: model.accuracy,
          trainingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
        }
      });
    }

    if (action === 'activate') {
      // Deactivate other models of same type
      await db.mLModel.updateMany({
        where: { type: 'demand_prediction' },
        data: { isActive: false }
      });

      // Activate the specified model
      const model = await db.mLModel.update({
        where: { id: modelId },
        data: { isActive: true }
      });

      return NextResponse.json({
        success: true,
        message: 'Model activated',
        model
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Unknown action'
    }, { status: 400 });

  } catch (error) {
    console.error('Model action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform model action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
