let streak = 0;

function testItem(type, emoji, depthRatio, message) {
    const item = document.getElementById('item');
    const result = document.getElementById('result');
    const water = document.getElementById('water-level');
    
    streak++;
    console.log("Current Knowledge Streak:", streak);
    
    // Reset position
    item.style.transition = 'none';
    item.style.top = '-60px';
    item.innerHTML = emoji;
    
    // Trigger animation
    setTimeout(() => {
        item.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Calculate position in tank (tank height is 300px)
        // Water level is 70% (210px from bottom, starts at 90px from top)
        const tankHeight = 300;
        const waterTop = 90; 
        
        let finalTop;
        if (depthRatio < 0.5) {
            // Floats (above or at water line)
            finalTop = waterTop - 20; 
            item.classList.add('floating');
        } else {
            // Sinks
            finalTop = tankHeight - 70; // Bottom of tank
            item.classList.remove('floating');
        }
        
        item.style.top = finalTop + 'px';
        
        let streakText = streak > 3 ? `<br><small style="color:var(--accent)">🔥 STREAK: ${streak} pokusů!</small>` : "";
        result.innerHTML = message + streakText;
        
        result.style.color = depthRatio < 0.5 ? 'var(--success)' : 'var(--error)';
        
        // Ripple effect on water
        water.style.height = '72%';
        setTimeout(() => water.style.height = '70%', 200);
    }, 50);
}

function checkQuiz(btn, isCorrect) {
    if (isCorrect) {
        btn.style.background = 'var(--success)';
        btn.style.color = '#000';
        btn.innerHTML = "W Sigma Answer! ✅";
    } else {
        btn.style.background = 'var(--error)';
        btn.innerHTML = "L Move, try again 💀";
        setTimeout(() => {
            btn.style.background = 'var(--glass)';
            btn.innerHTML = btn.dataset.original || "Try again";
        }, 1000);
    }
}

// Store original text for quiz buttons
document.querySelectorAll('.quiz-card button').forEach(btn => {
    btn.dataset.original = btn.innerHTML;
});
