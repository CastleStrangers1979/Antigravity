import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all recipes with ingredients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const recipes = await db.recipe.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        recipeIngredients: true,
        _count: {
          select: { productionBatches: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

// POST - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      productId, 
      description, 
      yieldQty, 
      yieldUnit, 
      prepTime, 
      bakeTime, 
      bakeTemp, 
      instructions,
      ingredients 
    } = body;

    const recipe = await db.recipe.create({
      data: {
        name,
        productId: productId || null,
        description,
        yieldQty: parseInt(yieldQty) || 1,
        yieldUnit: yieldUnit || 'piece',
        prepTime: prepTime ? parseInt(prepTime) : null,
        bakeTime: bakeTime ? parseInt(bakeTime) : null,
        bakeTemp: bakeTemp ? parseInt(bakeTemp) : null,
        instructions,
        recipeIngredients: {
          create: ingredients?.map((ing: { name: string; quantity: string; unit: string; cost: string; notes: string }) => ({
            name: ing.name,
            quantity: parseFloat(ing.quantity) || 0,
            unit: ing.unit || 'g',
            cost: ing.cost ? parseFloat(ing.cost) : null,
            notes: ing.notes,
          })) || []
        }
      },
      include: {
        recipeIngredients: true
      }
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}

// PUT - Update a recipe
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ingredients, ...data } = body;

    // Update recipe
    const recipe = await db.recipe.update({
      where: { id },
      data: {
        name: data.name,
        productId: data.productId || null,
        description: data.description,
        yieldQty: parseInt(data.yieldQty) || 1,
        yieldUnit: data.yieldUnit || 'piece',
        prepTime: data.prepTime ? parseInt(data.prepTime) : null,
        bakeTime: data.bakeTime ? parseInt(data.bakeTime) : null,
        bakeTemp: data.bakeTemp ? parseInt(data.bakeTemp) : null,
        instructions: data.instructions,
        isActive: data.isActive,
      },
    });

    // Update ingredients if provided
    if (ingredients) {
      // Delete existing ingredients
      await db.recipeIngredient.deleteMany({
        where: { recipeId: id }
      });

      // Create new ingredients
      await db.recipeIngredient.createMany({
        data: ingredients.map((ing: { name: string; quantity: string; unit: string; cost: string; notes: string }) => ({
          recipeId: id,
          name: ing.name,
          quantity: parseFloat(ing.quantity) || 0,
          unit: ing.unit || 'g',
          cost: ing.cost ? parseFloat(ing.cost) : null,
          notes: ing.notes,
        }))
      });
    }

    const updatedRecipe = await db.recipe.findUnique({
      where: { id },
      include: { recipeIngredients: true }
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

// DELETE - Delete a recipe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Delete ingredients first
    await db.recipeIngredient.deleteMany({
      where: { recipeId: id }
    });

    // Delete recipe
    await db.recipe.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}
