import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ethers } from "ethers";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { productId } = body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Only allow minting for limited vinyls and only by the seller
    if (product.type !== "LIMITED_VINYL" || product.sellerId !== userId) {
        return NextResponse.json({ error: "Only the artist can mint their own limited vinyl products." }, { status: 403 });
    }

    // Mock Blockchain Interaction with ethers
    // In production, connect to a real RPC provider and contract ABI:
    // const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    // const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, provider);
    // const contract = new ethers.Contract(contractAddress, abi, wallet);
    // const tx = await contract.mint(product.title);

    // Mocking transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a mock hash using ethers utils
    const mockHash = ethers.hexlify(ethers.randomBytes(32));

    await prisma.product.update({
        where: { id: productId },
        data: { txHash: mockHash }
    });

    return NextResponse.json({ success: true, txHash: mockHash });

  } catch (error: any) {
    console.error("Blockchain Mint Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
